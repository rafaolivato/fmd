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

    // ✅ MÉTODO PARA AGRUPAR ITENS DUPLICADOS
    private agruparItensDuplicados(itens: any[]): any[] {
        const agrupados = new Map();

        for (const item of itens) {
            const key = item.medicamentoId;

            if (agrupados.has(key)) {
                const quantidadeAtual = Number(agrupados.get(key).quantidadeSaida);
                const quantidadeNova = Number(item.quantidadeSaida);
                const quantidadeTotal = quantidadeAtual + quantidadeNova;

                agrupados.get(key).quantidadeSaida = quantidadeTotal;
            } else {
                agrupados.set(key, {
                    ...item,
                    quantidadeSaida: Number(item.quantidadeSaida)
                });
            }
        }

        return Array.from(agrupados.values());
    }

    // ✅ MÉTODO PARA GERAR DOCUMENTO DE REFERÊNCIA AUTOMÁTICO
    private gerarDocumentoReferencia(): string {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `SAIDA-${timestamp}-${random}`;
    }

    // ✅ MÉTODO PARA VALIDAR DATA (CORREÇÃO DEFINITIVA DO FUSO HORÁRIO)
    private validarDataMovimento(dataMovimento: string | Date): void {
        const dataString = typeof dataMovimento === 'string' ? dataMovimento : dataMovimento.toISOString().split('T')[0];
        
        const [ano, mes, dia] = dataString.split('-').map(Number);
        const dataInformada = new Date(ano, mes - 1, dia);
        const dataAtual = new Date();
        
        const dataInformadaSemHora = new Date(dataInformada.getFullYear(), dataInformada.getMonth(), dataInformada.getDate());
        const dataAtualSemHora = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), dataAtual.getDate());

        if (dataInformadaSemHora < dataAtualSemHora) {
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

        console.log('📅 Data recebida do frontend:', dataMovimento, 'Tipo:', typeof dataMovimento);
        console.log('📄 Documento referência recebido:', documentoReferencia);

        // ✅ VALIDAÇÃO DA DATA (CORRIGIDA)
        try {
            this.validarDataMovimento(dataMovimento);
            console.log('✅ Validação de data passou');
        } catch (error) {
            console.error('❌ Erro na validação de data:', error);
            throw error;
        }

        // ✅ VALIDAÇÃO DA JUSTIFICATIVA/OBSERVAÇÃO
        const justificativaValida = justificativa && justificativa.trim().length > 0;
        const observacaoValida = observacao && observacao.trim().length > 0;

        if (!justificativaValida && !observacaoValida) {
            throw new AppError(
                'Justificativa ou observação é obrigatória para movimentos de saída.',
                400
            );
        }

        return await prisma.$transaction(async (tx) => {
            // ✅ VERIFICAÇÃO DO NÚMERO DO DOCUMENTO (ADICIONE ESTA PARTE)
            const numeroDocumentoUnico = documentoReferencia || this.gerarDocumentoReferencia();
            
            console.log('🔍 Verificando número do documento:', numeroDocumentoUnico);
            const documentoExistente = await tx.movimento.findFirst({
                where: { 
                    numeroDocumento: numeroDocumentoUnico 
                },
            });

            if (documentoExistente) {
                console.log('❌ Número de documento já existe:', numeroDocumentoUnico);
                throw new AppError(
                    `Já existe um movimento com o número de documento: ${numeroDocumentoUnico}. Por favor, utilize um número único.`,
                    400
                );
            }
            console.log('✅ Número de documento disponível');

            // 1. Validação do Estabelecimento
            const estabelecimento = await tx.estabelecimento.findUnique({
                where: { id: estabelecimentoId }
            });

            if (!estabelecimento) {
                throw new AppError('Estabelecimento não encontrado.', 404);
            }

            // 2. Agrupa itens duplicados
            const itensAgrupados = this.agruparItensDuplicados(itens);
           
            let valorTotal = 0;
            const operacoesEmLote: Promise<any>[] = [];
            const itensParaProcessar: ItemProcessado[] = [];

            // 3. Processa cada Item AGRUPADO
            for (const item of itensAgrupados) {
                const { medicamentoId, quantidadeSaida, valorUnitario } = item;
                const quantidadeSaidaNumerica = Number(quantidadeSaida);

                // Validação de Quantidade
                if (isNaN(quantidadeSaidaNumerica) || quantidadeSaidaNumerica <= 0) {
                    throw new AppError('Quantidade de saída inválida.', 400);
                }

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

                // Calcula valor total
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

            // ✅ PREPARA O CAMPO OBSERVAÇÃO
            const observacaoFinal = justificativaValida 
                ? (observacaoValida ? `${justificativa} | ${observacao}` : justificativa)
                : observacao;

            // 4. CRIA O MOVIMENTO - CONVERTE dataMovimento para Date CORRETAMENTE
            const movimentoData = {
                tipoMovimentacao,
                documentoTipo: 'SAIDA_DIVERSA',
                numeroDocumento: numeroDocumentoUnico, // Já definido acima
                dataDocumento: new Date(dataMovimento + 'T00:00:00'),
                dataRecebimento: new Date(dataMovimento + 'T00:00:00'),
                observacao: observacaoFinal,
                fonteFinanciamento: 'RECURSOS_PRO_PRIOS',
                valorTotal: valorTotalFinal,
                estabelecimento: {
                    connect: { id: estabelecimentoId }
                },
            };

            const novoMovimento = await tx.movimento.create({
                data: movimentoData
            });

            console.log('✅ Movimento criado com sucesso:', novoMovimento.id);

            // 5. PROCESSAR AS OPERAÇÕES
            for (const item of itensParaProcessar) {
                const { medicamentoId, quantidadeSaidaNumerica, lotesInfo, estoqueGeralId } = item;

                for (const loteInfo of lotesInfo) {
                    // Atualiza o saldo do Lote
                    operacoesEmLote.push(
                        tx.estoqueLote.update({
                            where: { id: loteInfo.loteId },
                            data: { quantidade: { decrement: loteInfo.quantidadeBaixar } }
                        })
                    );

                    // Cria o item de movimento
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
                                localizacaoFisica: '',
                            }
                        })
                    );
                }

                operacoesEmLote.push(
                    tx.estoqueLocal.update({
                        where: { id: estoqueGeralId },
                        data: { quantidade: { decrement: quantidadeSaidaNumerica } },
                    })
                );
            }

            // 6. Executa todas as operações em paralelo
            await Promise.all(operacoesEmLote);

            // 7. Retorna o registro completo
            return tx.movimento.findUnique({
                where: { id: novoMovimento.id },
                include: { itensMovimentados: true }
            });
        });
    }
}

export { CreateMovimentoSaidaService };