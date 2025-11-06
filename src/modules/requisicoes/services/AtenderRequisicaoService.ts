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
      
      // 1. Busca a Requisição e Itens
      const requisicao = await tx.requisicao.findUnique({
        where: { id: requisicaoId },
        include: {
          itens: true, // Inclui todos os itens solicitados
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
        const { quantidadeSolicitada, medicamentoId } = itemOriginal;

        // ✅ CORREÇÃO: Remove a restrição de quantidade máxima
        // Validação 2: Quantidade atendida é válida?
        if (quantidadeAtender < 0) {
            throw new AppError(`Quantidade a atender (${quantidadeAtender}) não pode ser negativa.`, 400);
        }
        
        if (quantidadeAtender === 0) {
            // Se for 0, simplesmente pula o movimento, mas conta como 'processado'
            continue; 
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

        // 3.1 REDUZ ESTOQUE (Almoxarifado Central - Origem)
        operacoesEmLote.push(
          tx.estoqueLocal.update({
            where: { id: estoqueOrigem.id },
            data: {
              quantidade: { decrement: quantidadeAtender },
            },
          })
        );
        
        // 3.2 AUMENTA ESTOQUE (Farmácia Solicitante - Destino)
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
        
        // 3.3 ATUALIZA ItemRequisicao
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
      if (totalItensAtendidos === totalItensSolicitados) {
        // ✅ CORREÇÃO: Considera se todos os itens foram atendidos (mesmo que com quantidades diferentes)
        const todosItensAtendidos = requisicao.itens.every(item => {
          const itemAtendido = itensAtendidos.find(ia => ia.itemId === item.id);
          return itemAtendido && itemAtendido.quantidadeAtendida > 0;
        });
        
        if (todosItensAtendidos) {
          novoStatus = 'ATENDIDA';
        } else {
          novoStatus = 'ATENDIDA_PARCIALMENTE';
        }
      } else if (totalItensAtendidos > 0) {
        novoStatus = 'ATENDIDA_PARCIALMENTE'; // Atendeu alguns
      } else {
        novoStatus = 'CANCELADA'; // Poderia ser 'REJEITADA' ou 'CANCELADA' se todos forem zero
      }

      // 5. Atualiza o Status da Requisição
      operacoesEmLote.push(
        tx.requisicao.update({
          where: { id: requisicaoId },
          data: {
            status: novoStatus,
            updatedAt: new Date(),
          },
        })
      );
      
      // 6. Executa todas as operações
      await Promise.all(operacoesEmLote);
      
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