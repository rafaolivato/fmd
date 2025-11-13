import { Prisma, PrismaClient } from '@prisma/client';
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

        return await prisma.$transaction(async (tx) => {
            // 1. Validação do Estabelecimento
            const estabelecimento = await tx.estabelecimento.findUnique({
                where: { id: estabelecimentoId }
            });

            if (!estabelecimento) {
                throw new AppError('Estabelecimento não encontrado.', 404);
            }

            let valorTotal = 0;
            const operacoesEmLote: Promise<any>[] = [];
            
            // Array para armazenar informações dos itens (com tipo explícito)
            const itensParaProcessar: ItemProcessado[] = [];

            // 2. Processa cada Item para calcular valorTotal e preparar dados
            for (const item of itens) {
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
                        `Estoque insuficiente de ID ${medicamentoId}. Saldo na unidade: ${estoqueGeral?.quantidade ?? 0}.`,
                        400
                    );
                }

                // Calcula valor total - CORREÇÃO: Verificar se não é NaN
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

                    // Busca valor unitário original
                    const itemEntradaOriginal = await tx.itemMovimento.findFirst({
                        where: {
                            medicamentoId: medicamentoId,
                            numeroLote: lote.numeroLote,
                            movimento: {
                                tipoMovimentacao: 'ENTRADA'
                            }
                        },
                        orderBy: {
                            createdAt: 'desc'
                        }
                    });

                    const valorUnitarioFinal = valorUnitario || itemEntradaOriginal?.valorUnitario || 0;

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

                itensParaProcessar.push({
                    medicamentoId,
                    quantidadeSaidaNumerica,
                    valorUnitario: valorUnitario || 0,
                    lotesInfo,
                    estoqueGeralId: estoqueGeral.id
                });
            }

            // CORREÇÃO: Garantir que valorTotal não seja NaN
            const valorTotalFinal = isNaN(valorTotal) ? 0 : valorTotal;

            // 3. CRIA O MOVIMENTO COM VALOR TOTAL CALCULADO
            // Preparar os dados do movimento
            const movimentoData: any = {
                tipoMovimentacao,
                documentoTipo: 'SAIDA_DIVERSA',
                numeroDocumento: documentoReferencia || `SAIDA-${Date.now()}`,
                dataDocumento: new Date(dataMovimento),
                dataRecebimento: new Date(dataMovimento),
                observacao: justificativa + (observacao ? ` | ${observacao}` : ''),
                fonteFinanciamento: 'RECURSOS_PRO_PRIOS',
                valorTotal: valorTotalFinal,
            };

            // Adicionar estabelecimento baseado no schema
            // Tente uma das opções abaixo:

            // OPÇÃO A: Se o schema usa estabelecimento (relação)
            movimentoData.estabelecimento = {
                connect: { id: estabelecimentoId }
            };

            // OPÇÃO B: Se o schema usa estabelecimentoId diretamente
            // movimentoData.estabelecimentoId = estabelecimentoId;

            // Para fornecedorId, usar undefined em vez de null
            movimentoData.fornecedorId = undefined;

            const novoMovimento = await tx.movimento.create({
                data: movimentoData
            });

            // 4. AGORA PROCESSA AS OPERAÇÕES COM O MOVIMENTO ID DISPONÍVEL
            for (const item of itensParaProcessar) {
                const { medicamentoId, quantidadeSaidaNumerica, lotesInfo, estoqueGeralId } = item;

                // Baixa de estoque por lote e criação dos itens de movimento
                for (const loteInfo of lotesInfo) {
                    // Atualiza o saldo do Lote
                    operacoesEmLote.push(
                        tx.estoqueLote.update({
                            where: { id: loteInfo.loteId },
                            data: { quantidade: { decrement: loteInfo.quantidadeBaixar } }
                        })
                    );

                    // Cria o item de movimento individualmente
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

                // Atualiza EstoqueLocal
                operacoesEmLote.push(
                    tx.estoqueLocal.update({
                        where: { id: estoqueGeralId },
                        data: { quantidade: { decrement: quantidadeSaidaNumerica } },
                    })
                );
            }

            // 5. Executa todas as operações em paralelo
            await Promise.all(operacoesEmLote);

            // 6. Retorna o registro completo
            return tx.movimento.findUnique({
                where: { id: novoMovimento.id },
                include: { itensMovimentados: true }
            });
        });
    }
}

export { CreateMovimentoSaidaService };