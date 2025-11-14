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

    // ✅ MÉTODO PARA AGRUPAR ITENS DUPLICADOS
    private agruparItensDuplicados(itens: any[]): any[] {
        const agrupados = new Map();

        console.log('📦 Itens recebidos para agrupamento:', itens);

        for (const item of itens) {
            const key = item.medicamentoId;
            console.log(`🔍 Processando item: ${key}, quantidade: ${item.quantidadeSaida}`);

            if (agrupados.has(key)) {
                // Soma as quantidades de itens duplicados
                const quantidadeAtual = Number(agrupados.get(key).quantidadeSaida);
                const quantidadeNova = Number(item.quantidadeSaida);
                const quantidadeTotal = quantidadeAtual + quantidadeNova;

                console.log(`➡️ Item duplicado encontrado: ${key}`);
                console.log(`   Quantidade anterior: ${quantidadeAtual}`);
                console.log(`   Quantidade nova: ${quantidadeNova}`);
                console.log(`   Quantidade total: ${quantidadeTotal}`);

                agrupados.get(key).quantidadeSaida = quantidadeTotal;

                // Se houver valorUnitario diferente, mantém o primeiro ou calcula média?
                // Aqui estamos mantendo o primeiro valorUnitario encontrado
            } else {
                console.log(`✅ Novo item: ${key}, quantidade: ${item.quantidadeSaida}`);
                agrupados.set(key, {
                    ...item,
                    quantidadeSaida: Number(item.quantidadeSaida) // Garante que é número
                });
            }
        }

        const resultado = Array.from(agrupados.values());
        console.log('🎯 Itens agrupados final:', resultado);

        return resultado;
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

        return await prisma.$transaction(async (tx) => {
            // 1. Validação do Estabelecimento
            const estabelecimento = await tx.estabelecimento.findUnique({
                where: { id: estabelecimentoId }
            });

            if (!estabelecimento) {
                throw new AppError('Estabelecimento não encontrado.', 404);
            }

            // ✅ AGRUPAR ITENS DUPLICADOS ANTES DE PROCESSAR
            console.log('🔄 Iniciando agrupamento de itens...');
            const itensAgrupados = this.agruparItensDuplicados(itens);
            console.log('✅ Itens após agrupamento:', itensAgrupados);

            let valorTotal = 0;
            const operacoesEmLote: Promise<any>[] = [];

            // Array para armazenar informações dos itens (com tipo explícito)
            const itensParaProcessar: ItemProcessado[] = [];

            // 2. Processa cada Item AGRUPADO para calcular valorTotal e preparar dados
            for (const item of itensAgrupados) {
                const { medicamentoId, quantidadeSaida, valorUnitario } = item;
                const quantidadeSaidaNumerica = Number(quantidadeSaida);

                console.log(`📊 Processando item agrupado: ${medicamentoId}, quantidade: ${quantidadeSaidaNumerica}`);

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

                // Calcula valor total
                const valorItem = quantidadeSaidaNumerica * (valorUnitario || 0);
                valorTotal += valorItem;

                console.log(`💰 Valor do item ${medicamentoId}: ${valorItem}, Valor total acumulado: ${valorTotal}`);

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

                console.log(`📦 Lotes disponíveis para ${medicamentoId}:`, lotesDisponiveis.length);

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
                    console.log(`   🎯 Lote ${lote.numeroLote}: baixar ${quantidadeBaixar}, restante: ${quantidadeRestante}, valor: ${valorUnitarioFinal}`);
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

            // CORREÇÃO: Garantir que valorTotal não seja NaN
            const valorTotalFinal = isNaN(valorTotal) ? 0 : valorTotal;
            console.log(`💰 VALOR TOTAL FINAL DO MOVIMENTO: ${valorTotalFinal}`);

            const numeroDocumentoUnico = documentoReferencia || `SAIDA-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

            console.log(`📄 Número documento único: ${numeroDocumentoUnico}`);

            // ... continue com o resto do código original ...
            // 3. CRIA O MOVIMENTO COM VALOR TOTAL CALCULADO
            const movimentoData: any = {
                tipoMovimentacao,
                documentoTipo: 'SAIDA_DIVERSA',
                numeroDocumento: numeroDocumentoUnico,
                dataDocumento: new Date(dataMovimento),
                dataRecebimento: new Date(dataMovimento),
                observacao: justificativa + (observacao ? ` | ${observacao}` : ''),
                fonteFinanciamento: 'RECURSOS_PRO_PRIOS',
                valorTotal: valorTotalFinal,
                estabelecimento: {
                    connect: { id: estabelecimentoId }
                },

            };

            const novoMovimento = await tx.movimento.create({
                data: movimentoData
            });

            console.log(`✅ Movimento criado: ${novoMovimento.id}`);

            // 4. PROCESSAR AS OPERAÇÕES (AGORA COM ITENS JÁ AGRUPADOS)
            for (const item of itensParaProcessar) {
                const { medicamentoId, quantidadeSaidaNumerica, lotesInfo, estoqueGeralId } = item;

                console.log(`🔄 Processando item final: ${medicamentoId}, quantidade: ${quantidadeSaidaNumerica}`);

                // Baixa de estoque por lote e criação dos itens de movimento
                for (const loteInfo of lotesInfo) {
                    // Atualiza o saldo do Lote
                    operacoesEmLote.push(
                        tx.estoqueLote.update({
                            where: { id: loteInfo.loteId },
                            data: { quantidade: { decrement: loteInfo.quantidadeBaixar } }
                        })
                    );

                    // Cria o item de movimento (AGORA SEM DUPLICAÇÃO)
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