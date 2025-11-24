import { prisma } from '../../../database/prismaClient';
import { AppError } from '../../../shared/errors/AppError';
import { Prisma } from '@prisma/client';
import { IItemAtendidoDTO } from '../dtos/IAtendimentoRequisicaoDTO';

type PrismaTransaction = Prisma.TransactionClient;

class AtenderRequisicaoService {
  async execute(requisicaoId: string, itensAtendidos: IItemAtendidoDTO[]) {

    if (!itensAtendidos || itensAtendidos.length === 0) {
      throw new AppError('Nenhum item de atendimento fornecido.', 400);
    }

    return await prisma.$transaction(async (tx: PrismaTransaction) => {

      // 1. Search a Requisição e Itens
      const requisicao = await tx.requisicao.findUnique({
        where: { id: requisicaoId },
        include: {
          itens: {
            include: {
              medicamento: true // ✅ INCLUI MEDICAMENTO PARA VALIDAR CONTROLADOS
            }
          },
          atendente: { select: { id: true } },
        },
      });

      if (!requisicao) {
        throw new AppError('Requisição não encontrada.', 404);
      }

      if (requisicao.status !== 'PENDENTE') {
        throw new AppError(`A requisição já foi ${requisicao.status.toLowerCase()}.`, 400);
      }

      const atendenteId = requisicao.atendente!.id; // ID do Almoxarifado Central (Origem)
      const solicitanteId = requisicao.solicitanteId; // ID da Farmácia (Destino)

      // Mapeia os itens originais do BD para fácil acesso (itemId -> ItemRequisicao)
      const itensOriginaisMap = new Map(
        requisicao.itens.map(item => [item.id, item])
      );

      let totalItensSolicitados = requisicao.itens.length;
      let totalItensAtendidos = 0;

      const operacoesEmLote: Promise<any>[] = [];

      // 2. Processa cada Item de ATENDIMENTO enviado no BODY
      for (const itemAtendido of itensAtendidos) {
        const itemOriginal = itensOriginaisMap.get(itemAtendido.itemId);

        // Validação 1: O Item ID existe na requisição?
        if (!itemOriginal) {
          throw new AppError(`Item de requisição ID ${itemAtendido.itemId} não faz parte desta requisição.`, 400);
        }

        const quantidadeAtender = itemAtendido.quantidadeAtendida;
        const { quantidadeSolicitada, medicamentoId, medicamento } = itemOriginal;

        // ✅ CORREÇÃO: Remove a restrição de quantidade máxima
        // Validação 2: Quantidade atendida é válida?
        if (quantidadeAtender < 0) {
          throw new AppError(`Quantidade a atender (${quantidadeAtender}) não pode ser negativa.`, 400);
        }

        if (quantidadeAtender === 0) {
          // Se for 0, simplesmente pula o movimento, mas conta como 'processado'
          continue;
        }

        // ✅ NOVA VALIDAÇÃO: Para medicamentos controlados, verifica se há lotes selecionados
        if (medicamento.psicotropico && quantidadeAtender > 0) {
          if (!itemAtendido.lotes || itemAtendido.lotes.length === 0) {
            throw new AppError(
              `Para o medicamento controlado ${medicamento.principioAtivo}, é necessário selecionar os lotes.`,
              400
            );
          }

          // Valida se a soma dos lotes bate com a quantidade atendida
          const totalLotes = itemAtendido.lotes.reduce((sum, lote) => sum + lote.quantidade, 0);
          if (totalLotes !== quantidadeAtender) {
            throw new AppError(
              `A soma dos lotes (${totalLotes}) não corresponde à quantidade atendida (${quantidadeAtender}) para ${medicamento.principioAtivo}`,
              400
            );
          }
        }

        // Validação 3: VERIFICA SE O ESTOQUE NÃO FICARÁ NEGATIVO! (A parte mais importante)
        const estoqueOrigem = await tx.estoqueLocal.findUnique({
          where: {
            medicamentoId_estabelecimentoId: {
              medicamentoId: medicamentoId,
              estabelecimentoId: atendenteId,
            },
          },
        });

        if (!estoqueOrigem || estoqueOrigem.quantidade < quantidadeAtender) {
          throw new AppError(`Estoque insuficiente! O Almoxarifado tem ${estoqueOrigem?.quantidade ?? 0} unidades e tentou atender ${quantidadeAtender} do item ID ${medicamentoId}.`, 400);
        }

        // 3. MOVIMENTAÇÃO DE ESTOQUE E ATUALIZAÇÕES
        let quantidadeRestanteBaixar = quantidadeAtender;
        const lotesParaTransferir: any[] = []; // Array para armazenar os lotes consumidos da Origem

        // ✅ CORREÇÃO: Se o usuário selecionou lotes específicos, usa eles
        if (itemAtendido.lotes && itemAtendido.lotes.length > 0) {
          console.log(`📦 Usando lotes selecionados pelo usuário para ${medicamento.principioAtivo}`);
          
          for (const loteSelecionado of itemAtendido.lotes) {
            if (quantidadeRestanteBaixar === 0) break;

            // Valida o lote selecionado
            const loteEstoque = await tx.estoqueLote.findUnique({
              where: { id: loteSelecionado.loteId }
            });

            if (!loteEstoque) {
              throw new AppError(`Lote ${loteSelecionado.numeroLote} não encontrado`, 400);
            }

            if (loteEstoque.quantidade < loteSelecionado.quantidade) {
              throw new AppError(
                `Quantidade insuficiente no lote ${loteSelecionado.numeroLote}. Disponível: ${loteEstoque.quantidade}, Solicitado: ${loteSelecionado.quantidade}`,
                400
              );
            }

            if (loteEstoque.medicamentoId !== medicamentoId) {
              throw new AppError(`Lote ${loteSelecionado.numeroLote} não pertence ao medicamento correto`, 400);
            }

            // a) Atualiza o saldo do Lote na ORIGEM (Decrementa)
            operacoesEmLote.push(
              tx.estoqueLote.update({
                where: { id: loteSelecionado.loteId },
                data: { quantidade: { decrement: loteSelecionado.quantidade } }
              })
            );

            // b) Armazena o lote e a quantidade consumida para ser criado no destino
            lotesParaTransferir.push({
              numeroLote: loteEstoque.numeroLote,
              dataValidade: loteEstoque.dataValidade,
              fabricante: loteEstoque.fabricante,
              valorUnitario: loteEstoque.valorUnitario,
              quantidade: loteSelecionado.quantidade,
            });

            quantidadeRestanteBaixar -= loteSelecionado.quantidade;
          }
        } else {
          // ✅ CORREÇÃO: Se não há lotes selecionados, usa FIFO automático (para não controlados)
          console.log(`📦 Usando distribuição FIFO automática para ${medicamento.principioAtivo}`);

          // 1. Busca os lotes FIFO na Origem
          const lotesOrigem = await tx.estoqueLote.findMany({
            where: {
              medicamentoId,
              estabelecimentoId: atendenteId, // Origem
              quantidade: { gt: 0 },
            },
            orderBy: {
              dataValidade: 'asc',
            },
          });

          if (lotesOrigem.reduce((sum, l) => sum + l.quantidade, 0) < quantidadeAtender) {
            throw new AppError(`Estoque insuficiente nos lotes da Origem (${atendenteId}). Faltam ${quantidadeRestanteBaixar} unidades.`, 400);
          }

          // 2. Itera e baixa a quantidade de cada lote na Origem (e armazena para transferir)
          for (const lote of lotesOrigem) {
            if (quantidadeRestanteBaixar === 0) break;

            const quantidadeBaixarLote = Math.min(quantidadeRestanteBaixar, lote.quantidade);

            // a) Atualiza o saldo do Lote na ORIGEM (Decrementa)
            operacoesEmLote.push(
              tx.estoqueLote.update({
                where: { id: lote.id },
                data: { quantidade: { decrement: quantidadeBaixarLote } }
              })
            );

            // b) Armazena o lote e a quantidade consumida para ser criado no destino
            lotesParaTransferir.push({
              numeroLote: lote.numeroLote,
              dataValidade: lote.dataValidade,
              fabricante: lote.fabricante,
              valorUnitario: lote.valorUnitario,
              quantidade: quantidadeBaixarLote,
            });

            quantidadeRestanteBaixar -= quantidadeBaixarLote;
          }
        }

        if (quantidadeRestanteBaixar > 0) {
          throw new AppError(`Erro de lógica: Estoque insuficiente nos lotes para o medicamento ${medicamentoId}.`, 500);
        }

        // 3.2 CRIA/INCREMENTA LOTES NO DESTINO (Farmácia Solicitante)
        for (const loteInfo of lotesParaTransferir) {
          operacoesEmLote.push(
            tx.estoqueLote.upsert({
              where: {
                medicamentoId_estabelecimentoId_numeroLote: {
                  medicamentoId: medicamentoId,
                  estabelecimentoId: solicitanteId, // Destino
                  numeroLote: loteInfo.numeroLote,
                },
              },
              update: {
                quantidade: { increment: loteInfo.quantidade },
                dataValidade: loteInfo.dataValidade,
                fabricante: loteInfo.fabricante,
                valorUnitario: loteInfo.valorUnitario,
              },
              create: {
                medicamentoId: medicamentoId,
                estabelecimentoId: solicitanteId,
                quantidade: loteInfo.quantidade,
                numeroLote: loteInfo.numeroLote,
                dataValidade: loteInfo.dataValidade,
                fabricante: loteInfo.fabricante,
                valorUnitario: loteInfo.valorUnitario,
              },
            })
          );
        }

        // 3.3 ATUALIZA ESTOQUE LOCAL (Geral)
        // Atualiza EstoqueLocal Origem (Decrementa)
        operacoesEmLote.push(
          tx.estoqueLocal.update({
            where: { id: estoqueOrigem.id },
            data: {
              quantidade: { decrement: quantidadeAtender },
            },
          })
        );

        // Atualiza EstoqueLocal Destino (Incrementa)
        operacoesEmLote.push(
          tx.estoqueLocal.upsert({
            where: {
              medicamentoId_estabelecimentoId: {
                medicamentoId: medicamentoId,
                estabelecimentoId: solicitanteId,
              },
            },
            update: {
              quantidade: { increment: quantidadeAtender },
            },
            create: {
              medicamentoId: medicamentoId,
              estabelecimentoId: solicitanteId,
              quantidade: quantidadeAtender,
            },
          })
        );

        // 3.4 ATUALIZA ItemRequisicao
        operacoesEmLote.push(
          tx.itemRequisicao.update({
            where: { id: itemOriginal.id },
            data: {
              quantidadeAtendida: quantidadeAtender,
            },
          })
        );

        totalItensAtendidos++;
      }

      // 4. Determina o Status Final da Requisição
      let novoStatus: string;
      
      // ✅ CORREÇÃO: Considera se todos os itens foram atendidos (mesmo que com quantidades diferentes)
      const todosItensAtendidos = requisicao.itens.every(item => {
        const itemAtendido = itensAtendidos.find(ia => ia.itemId === item.id);
        return itemAtendido && itemAtendido.quantidadeAtendida > 0;
      });

      if (todosItensAtendidos) {
        novoStatus = 'ATENDIDA';
      } else if (totalItensAtendidos > 0) {
        novoStatus = 'ATENDIDA_PARCIALMENTE';
      } else {
        novoStatus = 'PENDENTE'; // Se nenhum item foi atendido, mantém como pendente
      }

      // 5. Atualiza o Status da Requisição
      operacoesEmLote.push(
        tx.requisicao.update({
          where: { id: requisicaoId },
          data: {
            status: novoStatus,
            dataAtendimento: novoStatus !== 'PENDENTE' ? new Date() : null,
            updatedAt: new Date(),
          },
        })
      );

      // 6. Executa todas as operações
      await Promise.all(operacoesEmLote);

      console.log(`✅ Requisição ${requisicaoId} atendida com status: ${novoStatus}`);

      // Retorna a requisição atualizada (com os itens)
      return tx.requisicao.findUnique({
        where: { id: requisicaoId },
        include: {
          itens: {
            include: {
              medicamento: true
            }
          }
        }
      });
    });
  }
}

export { AtenderRequisicaoService };