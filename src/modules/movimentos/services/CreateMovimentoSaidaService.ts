import { Prisma, PrismaClient } from '@prisma/client';
import { AppError } from '../../../shared/errors/AppError';
import { ICreateMovimentoSaidaDTO } from '../dtos/ICreateMovimentoSaidaDTO';

const prisma = new PrismaClient();

class CreateMovimentoSaidaService {
    async execute(data: ICreateMovimentoSaidaDTO) {
        const {
            estabelecimentoId,
            itens,
            tipoMovimentacao,
            documentoReferencia,
            dataMovimento,
            justificativa,
            observacao
        } = data;

        // A transação garante que todas as operações sejam bem-sucedidas ou nenhuma o seja.
        return await prisma.$transaction(async (tx) => {

            // 1. Validação do Estabelecimento
            const estabelecimento = await tx.estabelecimento.findUnique({
                where: { id: estabelecimentoId }
            });

            if (!estabelecimento) {
                throw new AppError('Estabelecimento não encontrado.', 404);
            }

            // 2. Cria o cabeçalho do Movimento (Saída)
            const novoMovimento = await tx.movimento.create({
                data: {
                    tipoMovimentacao,
                    documentoTipo: 'SAIDA_DIVERSA', // Define o tipo de documento
                    numeroDocumento: `SAIDA-${Date.now()}`,
                    dataDocumento: new Date(dataMovimento),
                    dataRecebimento: new Date(dataMovimento), // Reutiliza o campo para a data de saída
                    observacao: justificativa + (observacao ? ` | ${observacao}` : ''), // Combina as observações
                    estabelecimentoId,
                    fonteFinanciamento: 'N/A',
                    fornecedor: 'N/A',
                    valorTotal: 0,
                },
            });

            const operacoesEmLote: Promise<any>[] = [];

            // 3. Processa cada Item
            for (const item of itens) {
                const { medicamentoId, quantidadeSaida } = item;
                const quantidadeSaidaNumerica = Number(quantidadeSaida);

                // 3.0. Validação de Quantidade
                if (isNaN(quantidadeSaidaNumerica) || quantidadeSaidaNumerica <= 0) {
                    throw new AppError('Quantidade de saída inválida.', 400);
                }

                // 3.1. CHECAGEM DE ESTOQUE LOCAL (Geral)
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

                // 3.2. BUSCA DE LOTES (FIFO: Vencimento mais próximo primeiro)
                let quantidadeRestante = quantidadeSaidaNumerica;

                const lotesDisponiveis = await tx.estoqueLote.findMany({
                    where: {
                        medicamentoId,
                        estabelecimentoId,
                        quantidade: { gt: 0 },
                    },
                    orderBy: {
                        dataValidade: 'asc', // Regra FIFO
                    }
                });

                // 3.3. BAIXA DE ESTOQUE POR LOTE E CRIAÇÃO DE ITENS DO MOVIMENTO
                const itensMovimentoCriados: Prisma.ItemMovimentoCreateManyInput[] = [];

                for (const lote of lotesDisponiveis) {
                    if (quantidadeRestante === 0) break;

                    const quantidadeBaixar = Math.min(quantidadeRestante, lote.quantidade);

                    // A. Atualiza o saldo do Lote (DECREMENTA) - REUTILIZANDO A CORREÇÃO DE ESCOPO
                    operacoesEmLote.push(
                        ((loteId, baixa) => tx.estoqueLote.update({
                            where: { id: loteId },
                            data: { quantidade: { decrement: baixa } }
                        }))(lote.id, quantidadeBaixar)
                    );

                    // B. Prepara a criação do ItemMovimento (para histórico)
                    itensMovimentoCriados.push({
                        movimentoId: novoMovimento.id,
                        medicamentoId: medicamentoId,
                        valorUnitario: 0, // Pode ser ajustado se o custo for rastreado
                        quantidade: quantidadeBaixar, // Quantidade que saiu deste lote
                        numeroLote: lote.numeroLote,
                        dataValidade: lote.dataValidade,
                        fabricante: lote.fabricante,
                        localizacaoFisica: '', // Pode ser ajustado se necessário
                        // NOTE: A entrada de saldo não usa 'tipo', mas pode ser útil para relatórios de saída
                        // tipo: 'SAIDA' 
                    });

                    quantidadeRestante -= quantidadeBaixar;
                }

                // 3.4. Atualiza EstoqueLocal (Geral) - DECREMENTA
                operacoesEmLote.push(
                    tx.estoqueLocal.update({
                        where: { id: estoqueGeral.id },
                        // Usa a quantidade total para o decremento no estoque geral
                        data: { quantidade: { decrement: quantidadeSaidaNumerica } },
                    })
                );

                // 3.5. Cria os registros de ItemMovimento (Histórico)
                // Isso registra qual lote foi baixado no histórico da tabela Movimento
                operacoesEmLote.push(
                    tx.itemMovimento.createMany({
                        data: itensMovimentoCriados,
                    })
                );
            } // FIM DO LOOP DE ITENS

            // 4. Executa todas as operações em paralelo
            await Promise.all(operacoesEmLote);

            // 5. Retorna o registro completo
            return tx.movimento.findUnique({
                where: { id: novoMovimento.id },
                // CORREÇÃO B: Usando o nome correto da relação do Prisma
                include: { itensMovimentados: true }
            });
        });
    }
}

export { CreateMovimentoSaidaService };