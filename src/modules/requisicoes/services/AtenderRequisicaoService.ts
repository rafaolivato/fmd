import { prisma } from '../../../database/prismaClient';
import { AppError } from '../../../shared/errors/AppError';
import { Prisma } from '@prisma/client';
import { IItemAtendidoDTO } from '../dtos/IAtendimentoRequisicaoDTO';

type PrismaTransaction = Prisma.TransactionClient;

class AtenderRequisicaoService {
  async execute(requisicaoId: string, itens: IItemAtendidoDTO[]) { // Mudei para 'itens'

    console.log('🔧 AtenderRequisicaoService - Iniciando:', {
      requisicaoId,
      totalItens: itens?.length || 0
    });

    if (!itens || itens.length === 0) {
      throw new AppError('Nenhum item de atendimento fornecido.', 400);
    }

    return await prisma.$transaction(async (tx: PrismaTransaction) => {

      // 1. Busca a Requisição e Itens
      const requisicao = await tx.requisicao.findUnique({
        where: { id: requisicaoId },
        include: {
          itens: {
            include: {
              medicamento: true
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

      console.log('🏥 IDs estabelecimento:', { atendenteId, solicitanteId });

      // Mapeia os itens originais do BD para fácil acesso
      const itensOriginaisMap = new Map(
        requisicao.itens.map(item => [item.id, item])
      );

      let totalItensAtendidos = 0;
      const operacoesEmLote: Promise<any>[] = [];

      // 2. Processa cada Item de ATENDIMENTO enviado no BODY
      for (const itemAtendido of itens) { // Agora usando 'itens'
        console.log(`📦 Processando item: ${itemAtendido.itemId}`, {
          quantidadeAtendida: itemAtendido.quantidadeAtendida,
          lotesSelecionados: itemAtendido.lotes?.length || 0
        });

        const itemOriginal = itensOriginaisMap.get(itemAtendido.itemId);

        // Validação 1: O Item ID existe na requisição?
        if (!itemOriginal) {
          throw new AppError(`Item de requisição ID ${itemAtendido.itemId} não faz parte desta requisição.`, 400);
        }

        const quantidadeAtender = itemAtendido.quantidadeAtendida;
        const { quantidadeSolicitada, medicamentoId, medicamento } = itemOriginal;

        console.log(`💊 Medicamento: ${medicamento.principioAtivo}`, {
          solicitado: quantidadeSolicitada,
          atendendo: quantidadeAtender,
          controlado: medicamento.psicotropico
        });

        // Validação 2: Quantidade atendida é válida?
        if (quantidadeAtender < 0) {
          throw new AppError(`Quantidade a atender (${quantidadeAtender}) não pode ser negativa.`, 400);
        }

        if (quantidadeAtender === 0) {
          console.log(`⏭️ Pulando item ${itemAtendido.itemId} - quantidade zero`);
          continue;
        }

        // ✅ VALIDAÇÃO PARA MEDICAMENTOS CONTROLADOS
        if (medicamento.psicotropico) {
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

          console.log(`✅ Validação controlado OK: ${totalLotes} = ${quantidadeAtender}`);
        }

        // Validação 3: VERIFICA ESTOQUE GERAL
        const estoqueOrigem = await tx.estoqueLocal.findUnique({
          where: {
            medicamentoId_estabelecimentoId: {
              medicamentoId: medicamentoId,
              estabelecimentoId: atendenteId,
            },
          },
        });

        if (!estoqueOrigem || estoqueOrigem.quantidade < quantidadeAtender) {
          throw new AppError(
            `Estoque insuficiente! O Almoxarifado tem ${estoqueOrigem?.quantidade ?? 0} unidades e tentou atender ${quantidadeAtender} do item ${medicamento.principioAtivo}.`,
            400
          );
        }

        console.log(`✅ Estoque geral disponível: ${estoqueOrigem.quantidade}`);

        // 3. MOVIMENTAÇÃO DE ESTOQUE
        let quantidadeRestanteBaixar = quantidadeAtender;
        const lotesParaTransferir: any[] = [];

        // ✅ SE O USUÁRIO SELECIONOU LOTES ESPECÍFICOS
        if (itemAtendido.lotes && itemAtendido.lotes.length > 0) {
          console.log(`📦 Usando lotes selecionados pelo usuário para ${medicamento.principioAtivo}`);
          
          for (const loteSelecionado of itemAtendido.lotes) {
            if (quantidadeRestanteBaixar === 0) break;

            console.log(`🔍 Validando lote selecionado:`, loteSelecionado);

            // Valida o lote selecionado
            const loteEstoque = await tx.estoqueLote.findUnique({
              where: { id: loteSelecionado.loteId },
              include: { medicamento: true }
            });

            if (!loteEstoque) {
              throw new AppError(`Lote ${loteSelecionado.numeroLote} não encontrado`, 400);
            }

            if (loteEstoque.medicamentoId !== medicamentoId) {
              throw new AppError(`Lote ${loteSelecionado.numeroLote} não pertence ao medicamento ${medicamento.principioAtivo}`, 400);
            }

            if (loteEstoque.quantidade < loteSelecionado.quantidade) {
              throw new AppError(
                `Quantidade insuficiente no lote ${loteSelecionado.numeroLote}. Disponível: ${loteEstoque.quantidade}, Solicitado: ${loteSelecionado.quantidade}`,
                400
              );
            }

            if (loteEstoque.estabelecimentoId !== atendenteId) {
              throw new AppError(`Lote ${loteSelecionado.numeroLote} não pertence ao estabelecimento de origem`, 400);
            }

            console.log(`✅ Lote validado: ${loteSelecionado.numeroLote} - Qtd: ${loteSelecionado.quantidade}`);

            // a) Atualiza o saldo do Lote na ORIGEM (Decrementa)
            operacoesEmLote.push(
              tx.estoqueLote.update({
                where: { id: loteSelecionado.loteId },
                data: { quantidade: { decrement: loteSelecionado.quantidade } }
              })
            );

            // b) Armazena o lote para transferir ao destino
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
          // ✅ DISTRIBUIÇÃO FIFO AUTOMÁTICA (para não controlados)
          console.log(`📦 Usando distribuição FIFO automática para ${medicamento.principioAtivo}`);

          // Busca os lotes FIFO na Origem
          const lotesOrigem = await tx.estoqueLote.findMany({
            where: {
              medicamentoId,
              estabelecimentoId: atendenteId,
              quantidade: { gt: 0 },
            },
            orderBy: {
              dataValidade: 'asc',
            },
          });

          console.log(`📊 Lotes disponíveis para FIFO: ${lotesOrigem.length}`);

          if (lotesOrigem.reduce((sum, l) => sum + l.quantidade, 0) < quantidadeAtender) {
            throw new AppError(
              `Estoque insuficiente nos lotes da Origem para ${medicamento.principioAtivo}. Disponível: ${lotesOrigem.reduce((sum, l) => sum + l.quantidade, 0)}, Necessário: ${quantidadeAtender}`,
              400
            );
          }

          // Itera e baixa a quantidade de cada lote na Origem
          for (const lote of lotesOrigem) {
            if (quantidadeRestanteBaixar === 0) break;

            const quantidadeBaixarLote = Math.min(quantidadeRestanteBaixar, lote.quantidade);

            console.log(`🔁 FIFO: Lote ${lote.numeroLote} - Baixando ${quantidadeBaixarLote} de ${lote.quantidade}`);

            operacoesEmLote.push(
              tx.estoqueLote.update({
                where: { id: lote.id },
                data: { quantidade: { decrement: quantidadeBaixarLote } }
              })
            );

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
          throw new AppError(`Erro de lógica: Não foi possível baixar toda a quantidade do medicamento ${medicamento.principioAtivo}. Restante: ${quantidadeRestanteBaixar}`, 500);
        }

        // 3.2 CRIA/INCREMENTA LOTES NO DESTINO
        console.log(`🔄 Transferindo ${lotesParaTransferir.length} lotes para destino`);
        
        for (const loteInfo of lotesParaTransferir) {
          operacoesEmLote.push(
            tx.estoqueLote.upsert({
              where: {
                medicamentoId_estabelecimentoId_numeroLote: {
                  medicamentoId: medicamentoId,
                  estabelecimentoId: solicitanteId,
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

        // 3.3 ATUALIZA ESTOQUE LOCAL
        // Origem (Decrementa)
        operacoesEmLote.push(
          tx.estoqueLocal.update({
            where: { id: estoqueOrigem.id },
            data: {
              quantidade: { decrement: quantidadeAtender },
            },
          })
        );

        // Destino (Incrementa)
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
        console.log(`✅ Item ${itemAtendido.itemId} processado com sucesso`);
      }

      // 4. Determina o Status Final da Requisição
      let novoStatus: string;
      
      const todosItensAtendidos = requisicao.itens.every(item => {
        const itemAtendido = itens.find(ia => ia.itemId === item.id);
        return itemAtendido && itemAtendido.quantidadeAtendida > 0;
      });

      if (todosItensAtendidos) {
        novoStatus = 'ATENDIDA';
      } else if (totalItensAtendidos > 0) {
        novoStatus = 'ATENDIDA_PARCIALMENTE';
      } else {
        novoStatus = 'PENDENTE';
      }

      console.log(`📊 Status final: ${novoStatus} (${totalItensAtendidos}/${requisicao.itens.length} itens atendidos)`);

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
      console.log(`⚡ Executando ${operacoesEmLote.length} operações em lote...`);
      await Promise.all(operacoesEmLote);

      console.log(`🎉 Requisição ${requisicaoId} atendida com sucesso! Status: ${novoStatus}`);

      // Retorna a requisição atualizada
      return tx.requisicao.findUnique({
        where: { id: requisicaoId },
        include: {
          itens: {
            include: {
              medicamento: true
            }
          },
          solicitante: {
            select: {
              id: true,
              nome: true
            }
          },
          atendente: {
            select: {
              id: true,
              nome: true
            }
          }
        }
      });
    });
  }
}

export { AtenderRequisicaoService };