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
        const dataFormatada = [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, '0'),
            String(now.getDate()).padStart(2, '0')
        ].join('');

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
        const dataInformadaSemHora = new Date(ano, mes - 1, dia);

        const dataAtual = new Date();
        const dataAtualSemHora = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), dataAtual.getDate());

        if (dataInformadaSemHora.getTime() < dataAtualSemHora.getTime()) {
            throw new AppError(
                'Não é permitido registrar movimentos com data anterior à data atual.',
                400
            );
        }
    }

    /**
     * Processa os lotes selecionados pelo usuário (NOVA FUNÇÃO)
     * @param lotesSelecionados Lotes selecionados no frontend
     * @param medicamentoId ID do medicamento
     * @param estabelecimentoId ID do estabelecimento
     * @param quantidadeTotal Quantidade total a baixar
     * @param tx Transação do Prisma
     * @returns Array de LoteInfo processados
     */
    private async processarLotesSelecionados(
        lotesSelecionados: any[],
        medicamentoId: string,
        estabelecimentoId: string,
        quantidadeTotal: number,
        tx: any
    ): Promise<LoteInfo[]> {
        const lotesInfo: LoteInfo[] = [];
        let quantidadeProcessada = 0;

        // Valida se há lotes selecionados
        if (!lotesSelecionados || lotesSelecionados.length === 0) {
            throw new AppError(
                `Nenhum lote selecionado para o medicamento ${medicamentoId}.`,
                400
            );
        }

        // Processa cada lote selecionado
        for (const loteSelecionado of lotesSelecionados) {
            if (quantidadeProcessada >= quantidadeTotal) break;

            const { loteId, quantidade } = loteSelecionado;

            // Busca informações completas do lote
            const lote = await tx.estoqueLote.findUnique({
                where: { id: loteId }
            });

            if (!lote) {
                throw new AppError(`Lote ${loteId} não encontrado.`, 404);
            }

            // Valida se o lote pertence ao medicamento e estabelecimento
            if (lote.medicamentoId !== medicamentoId || lote.estabelecimentoId !== estabelecimentoId) {
                throw new AppError(`Lote ${loteId} não pertence ao medicamento/estabelecimento.`, 400);
            }

            // Valida estoque disponível no lote
            if (lote.quantidade < quantidade) {
                throw new AppError(
                    `Estoque insuficiente no lote ${lote.numeroLote}. Disponível: ${lote.quantidade}, Solicitado: ${quantidade}`,
                    400
                );
            }

            // Adiciona ao array de lotes processados
            lotesInfo.push({
                loteId: lote.id,
                numeroLote: lote.numeroLote,
                dataValidade: lote.dataValidade,
                fabricante: lote.fabricante || '',
                quantidadeBaixar: quantidade,
                valorUnitarioFinal: Number(lote.valorUnitario)
            });

            quantidadeProcessada += quantidade;
        }

        // Valida se a soma dos lotes é igual à quantidade total
        if (quantidadeProcessada !== quantidadeTotal) {
            throw new AppError(
                `A soma das quantidades dos lotes (${quantidadeProcessada}) não corresponde à quantidade total (${quantidadeTotal}) para o medicamento ${medicamentoId}.`,
                400
            );
        }

        return lotesInfo;
    }

    /**
     * Processa lotes usando FIFO (fallback quando não há lotes selecionados)
     */
    private async processarLotesFIFO(
        medicamentoId: string,
        estabelecimentoId: string,
        quantidadeTotal: number,
        tx: any
    ): Promise<LoteInfo[]> {
        let quantidadeRestante = quantidadeTotal;
        const lotesInfo: LoteInfo[] = [];

        // Busca lotes disponíveis ordenados por validade (FIFO)
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

        // Processa lotes FIFO
        for (const lote of lotesDisponiveis) {
            if (quantidadeRestante === 0) break;

            const quantidadeBaixar = Math.min(quantidadeRestante, lote.quantidade);

            lotesInfo.push({
                loteId: lote.id,
                numeroLote: lote.numeroLote,
                dataValidade: lote.dataValidade,
                fabricante: lote.fabricante || '',
                quantidadeBaixar,
                valorUnitarioFinal: Number(lote.valorUnitario)
            });

            quantidadeRestante -= quantidadeBaixar;
        }

        if (quantidadeRestante > 0) {
            throw new AppError(
                `Estoque insuficiente nos lotes para o medicamento ${medicamentoId}. Faltam ${quantidadeRestante} unidades.`,
                400
            );
        }

        return lotesInfo;
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
            
            // 3. Define o número do documento
            const numeroDocumentoUnico = documentoReferencia && documentoReferencia.trim().length > 0 
                ? documentoReferencia.trim().toUpperCase()
                : this.gerarDocumentoReferencia();

            // 4. Validação do Estabelecimento
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

            // 6. Processa cada Item AGRUPADO
            for (const item of itensAgrupados) {
                const { medicamentoId, quantidadeSaida, valorUnitario, lotes } = item;
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

                // Calcula valor total
                const valorItem = quantidadeSaidaNumerica * (valorUnitario || 0);
                valorTotal += valorItem;

                let lotesInfo: LoteInfo[];

                // ✅ DECISÃO CRÍTICA: Usa lotes selecionados ou FIFO?
                if (lotes && lotes.length > 0) {
                    // ✅ USA OS LOTES SELECIONADOS PELO USUÁRIO
                    console.log(`Usando lotes selecionados para medicamento ${medicamentoId}:`, lotes);
                    lotesInfo = await this.processarLotesSelecionados(
                        lotes,
                        medicamentoId,
                        estabelecimentoId,
                        quantidadeSaidaNumerica,
                        tx
                    );
                } else {
                    // ❌ FALLBACK: Usa FIFO (comportamento anterior)
                    console.log(`Usando FIFO para medicamento ${medicamentoId} (nenhum lote selecionado)`);
                    lotesInfo = await this.processarLotesFIFO(
                        medicamentoId,
                        estabelecimentoId,
                        quantidadeSaidaNumerica,
                        tx
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
                const dataMovimentoDate = new Date(dataMovimento + 'T00:00:00Z'); 

                const movimentoData = {
                    tipoMovimentacao,
                    documentoTipo: 'SAIDA_DIVERSA',
                    numeroDocumento: numeroDocumentoUnico,
                    dataDocumento: dataMovimentoDate,
                    dataRecebimento: dataMovimentoDate,
                    observacao: observacaoFinal,
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
                                    localizacaoFisica: '',
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
                if (error.code === 'P2002') {
                    throw new AppError(
                        `O número de documento '${numeroDocumentoUnico}' já existe no sistema. Tente novamente ou forneça um número de referência diferente.`,
                        400
                    );
                }
                throw error;
            }
        });
    }
}

export { CreateMovimentoSaidaService };