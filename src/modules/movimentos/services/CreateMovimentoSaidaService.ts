import { PrismaClient } from '@prisma/client';
import { AppError } from '../../../shared/errors/AppError';
import { ICreateMovimentoSaidaDTO } from '../dtos/ICreateMovimentoSaidaDTO';

const prisma = new PrismaClient();

// Definir interface para os lotes
interface LoteInfo {
    loteId: string;
    numeroLote: string;
    dataValidade: Date;
    fabricante: string;
    quantidadeBaixar: number;
    valorUnitarioFinal: number;
}

// Definir interface para os itens processados
interface ItemProcessado {
    medicamentoId: string;
    quantidadeSaidaNumerica: number;
    valorUnitario: number;
    lotesInfo: LoteInfo[];
    estoqueGeralId: string;
}

class CreateMovimentoSaidaService {

    /**
     * Agrupa itens duplicados no array de entrada, somando as quantidades de saída.
     * @param itens Array de itens a serem agrupados.
     * @returns Array de itens agrupados.
     */
    private agruparItensDuplicados(itens: any[]): any[] {
        const agrupados = new Map();

        for (const item of itens) {
            const key = item.medicamentoId;
            const quantidadeNova = Number(item.quantidadeSaida);

            if (isNaN(quantidadeNova) || quantidadeNova <= 0) {
                continue; // Ignora itens com quantidade inválida
            }

            if (agrupados.has(key)) {
                const quantidadeAtual = Number(agrupados.get(key).quantidadeSaida);
                agrupados.get(key).quantidadeSaida = quantidadeAtual + quantidadeNova;
            } else {
                agrupados.set(key, {
                    ...item,
                    quantidadeSaida: quantidadeNova // Já é numérica aqui
                });
            }
        }

        return Array.from(agrupados.values());
    }

    /**
     * Gera um número de documento de referência único para saídas não fiscais.
     * Padrão: SAIDA-YYYYMMDD-RANDOMHEX
     * @returns String única de referência.
     */
    private gerarDocumentoReferencia(): string {
        const now = new Date();
        // Padrão de Data (Ex: 20251118)
        const dataFormatada = [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, '0'),
            String(now.getDate()).padStart(2, '0')
        ].join('');

        // Código aleatório de 6 caracteres (para unicidade)
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();

        return `SAIDA-${dataFormatada}-${random}`;
    }

    /**
     * Valida se a data do movimento é igual ou posterior à data atual (sem considerar horas).
     * @param dataMovimento Data informada pelo usuário.
     */
    private validarDataMovimento(dataMovimento: string | Date): void {
        const dataString = typeof dataMovimento === 'string' ? dataMovimento : dataMovimento.toISOString().split('T')[0];

        const [ano, mes, dia] = dataString.split('-').map(Number);
        // Cria a data informada às 00:00:00 local para comparação
        const dataInformadaSemHora = new Date(ano, mes - 1, dia);

        const dataAtual = new Date();
        // Cria a data atual às 00:00:00 local para comparação
        const dataAtualSemHora = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), dataAtual.getDate());

        if (dataInformadaSemHora.getTime() < dataAtualSemHora.getTime()) {
            throw new AppError(
                'Não é permitido registrar movimentos com data anterior à data atual.',
                400
            );
        }
    }

    async execute(data: ICreateMovimentoSaidaDTO) {
        const {
            estabelecimentoId,
            itens,
            tipoMovimentacao = 'SAIDA',
            documentoReferencia,
            dataMovimento,
            justificativa,
            observacao
        } = data;

        // 1. Validação inicial da Data
        this.validarDataMovimento(dataMovimento);

        // 2. Validação da Justificativa/Observação
        const justificativaValida = justificativa && justificativa.trim().length > 0;
        const observacaoValida = observacao && observacao.trim().length > 0;

        if (!justificativaValida && !observacaoValida) {
            throw new AppError(
                'Justificativa ou observação é obrigatória para movimentos de saída.',
                400
            );
        }

        // Inicia a transação
        return await prisma.$transaction(async (tx) => {
            
            // 3. Define o número do documento: usa o fornecido ou gera um único (SAIDA-...)
            const numeroDocumentoUnico = documentoReferencia && documentoReferencia.trim().length > 0 
                ? documentoReferencia.trim().toUpperCase()
                : this.gerarDocumentoReferencia();

            // 4. Validação do Estabelecimento (dentro da transação)
            const estabelecimento = await tx.estabelecimento.findUnique({
                where: { id: estabelecimentoId }
            });

            if (!estabelecimento) {
                throw new AppError('Estabelecimento não encontrado.', 404);
            }

            // 5. Agrupa itens duplicados
            const itensAgrupados = this.agruparItensDuplicados(itens);

            let valorTotal = 0;
            const operacoesEmLote: Promise<any>[] = [];
            const itensParaProcessar: ItemProcessado[] = [];

            // 6. Processa cada Item AGRUPADO, checa estoque e define lotes (FIFO)
            for (const item of itensAgrupados) {
                const { medicamentoId, quantidadeSaida, valorUnitario } = item;
                const quantidadeSaidaNumerica = Number(quantidadeSaida);

                // Checagem de Estoque Local
                const estoqueGeral = await tx.estoqueLocal.findUnique({
                    where: {
                        medicamentoId_estabelecimentoId: { medicamentoId, estabelecimentoId },
                    },
                });

                if (!estoqueGeral || estoqueGeral.quantidade < quantidadeSaidaNumerica) {
                    throw new AppError(
                        `Estoque insuficiente para o medicamento ${medicamentoId}. Saldo disponível: ${estoqueGeral?.quantidade ?? 0}.`,
                        400
                    );
                }

                // Calcula valor total (se valor unitário for fornecido)
                const valorItem = quantidadeSaidaNumerica * (valorUnitario || 0);
                valorTotal += valorItem;

                // Busca de Lotes (FIFO)
                let quantidadeRestante = quantidadeSaidaNumerica;
                const lotesDisponiveis = await tx.estoqueLote.findMany({
                    where: {
                        medicamentoId,
                        estabelecimentoId,
                        quantidade: { gt: 0 },
                    },
                    orderBy: {
                        dataValidade: 'asc',
                    }
                });

                const lotesInfo: LoteInfo[] = [];

                // Prepara informações dos lotes para baixa
                for (const lote of lotesDisponiveis) {
                    if (quantidadeRestante === 0) break;

                    const quantidadeBaixar = Math.min(quantidadeRestante, lote.quantidade);
                    const valorUnitarioLote = Number(lote.valorUnitario);
                    // Prioriza o valorUnitario da saída, senão usa o valor do lote
                    const valorUnitarioFinal = valorUnitario || valorUnitarioLote || 0;

                    lotesInfo.push({
                        loteId: lote.id,
                        numeroLote: lote.numeroLote,
                        dataValidade: lote.dataValidade,
                        fabricante: lote.fabricante || '',
                        quantidadeBaixar,
                        valorUnitarioFinal
                    });

                    quantidadeRestante -= quantidadeBaixar;
                }

                if (quantidadeRestante > 0) {
                    throw new AppError(
                        `Estoque insuficiente nos lotes para o medicamento ${medicamentoId}. Faltam ${quantidadeRestante} unidades.`,
                        400
                    );
                }

                itensParaProcessar.push({
                    medicamentoId,
                    quantidadeSaidaNumerica,
                    valorUnitario: valorUnitario || 0,
                    lotesInfo,
                    estoqueGeralId: estoqueGeral.id
                });
            }

            const valorTotalFinal = isNaN(valorTotal) ? 0 : valorTotal;

            // Prepara o campo Observação combinando Justificativa e Observação
            const observacaoFinal = justificativaValida
                ? (observacaoValida ? `Justificativa: ${justificativa} | Obs: ${observacao}` : `Justificativa: ${justificativa}`)
                : observacao;
            
            
            // 7. CRIA O MOVIMENTO PRINCIPAL
            try {
                // Converte a data string para Date com fuso 00:00:00 para manter a consistência
                const dataMovimentoDate = new Date(dataMovimento + 'T00:00:00Z'); 

                const movimentoData = {
                    tipoMovimentacao,
                    documentoTipo: 'SAIDA_DIVERSA',
                    numeroDocumento: numeroDocumentoUnico,
                    dataDocumento: dataMovimentoDate,
                    dataRecebimento: dataMovimentoDate,
                    observacao: observacaoFinal,
                    // Valores fixos assumidos para Saída Diversa
                    fonteFinanciamento: 'RECURSOS_PRO_PRIOS',
                    valorTotal: valorTotalFinal,
                    estabelecimento: {
                        connect: { id: estabelecimentoId }
                    },
                };

                const novoMovimento = await tx.movimento.create({ data: movimentoData });

                // 8. PROCESSAR AS OPERAÇÕES DE BAIXA E CRIAÇÃO DE ITENS DE MOVIMENTO
                for (const item of itensParaProcessar) {
                    const { medicamentoId, quantidadeSaidaNumerica, lotesInfo, estoqueGeralId } = item;

                    // Baixa de Lotes e Criação de ItemMovimento
                    for (const loteInfo of lotesInfo) {
                        // Atualiza o saldo do Lote (decrement)
                        operacoesEmLote.push(
                            tx.estoqueLote.update({
                                where: { id: loteInfo.loteId },
                                data: { quantidade: { decrement: loteInfo.quantidadeBaixar } }
                            })
                        );

                        // Cria o item de movimento detalhado
                        operacoesEmLote.push(
                            tx.itemMovimento.create({
                                data: {
                                    movimentoId: novoMovimento.id,
                                    medicamentoId: medicamentoId,
                                    valorUnitario: loteInfo.valorUnitarioFinal,
                                    quantidade: loteInfo.quantidadeBaixar,
                                    numeroLote: loteInfo.numeroLote,
                                    dataValidade: loteInfo.dataValidade,
                                    fabricante: loteInfo.fabricante,
                                    localizacaoFisica: '', // Pode ser preenchido se necessário
                                }
                            })
                        );
                    }

                    // Atualiza o saldo do Estoque Geral Local (decrement)
                    operacoesEmLote.push(
                        tx.estoqueLocal.update({
                            where: { id: estoqueGeralId },
                            data: { quantidade: { decrement: quantidadeSaidaNumerica } },
                        })
                    );
                }

                // 9. Executa todas as operações de baixa em paralelo
                await Promise.all(operacoesEmLote);

                // 10. Retorna o registro completo
                return tx.movimento.findUnique({
                    where: { id: novoMovimento.id },
                    include: { itensMovimentados: true }
                });
            } catch (error: any) {
                // 🚨 Captura o erro P2002 (violação da restrição @unique)
                if (error.code === 'P2002') {
                    throw new AppError(
                        `O número de documento '${numeroDocumentoUnico}' já existe no sistema. Tente novamente ou forneça um número de referência diferente.`,
                        400
                    );
                }
                // Lança outros erros de forma normal
                throw error;
            }
        });
    }
}

export { CreateMovimentoSaidaService };