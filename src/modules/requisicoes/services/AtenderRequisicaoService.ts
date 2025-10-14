// src/modules/requisicoes/services/AtenderRequisicaoService.ts

import { prisma } from '../../../database/prismaClient';
import { AppError } from '../../../shared/errors/AppError';
import { Prisma } from '@prisma/client';

type PrismaTransaction = Prisma.TransactionClient;

class AtenderRequisicaoService {
  async execute(requisicaoId: string) {
    
    return await prisma.$transaction(async (tx: PrismaTransaction) => {
      
      // 1. Busca a Requisição e Itens
      const requisicao = await tx.requisicao.findUnique({
        where: { id: requisicaoId },
        include: {
          itens: true, // Inclui todos os itens solicitados
        },
      });

      if (!requisicao) {
        throw new AppError('Requisição não encontrada.', 404);
      }

      if (requisicao.status !== 'PENDENTE') {
        throw new AppError(`A requisição já foi ${requisicao.status.toLowerCase()}.`, 400);
      }
      
      // Armazena todas as operações de banco de dados
      const operacoesEmLote: Promise<any>[] = []; 
      
      const { solicitanteId, atendenteId, itens } = requisicao;

      // 2. Processa cada Item
      for (const item of itens) {
        const { medicamentoId, quantidadeSolicitada } = item;
        
        // 2.1 Verifica o Saldo no Estabelecimento de Origem (Atendente)
        const estoqueOrigem = await tx.estoqueLocal.findUnique({
          where: {
            medicamentoId_estabelecimentoId: {
              medicamentoId: medicamentoId,
              estabelecimentoId: atendenteId, // Almoxarifado
            },
          },
        });

        if (!estoqueOrigem || estoqueOrigem.quantidade < quantidadeSolicitada) {
          throw new AppError(`Estoque insuficiente no local de origem (ID: ${medicamentoId}).`, 400);
        }

        // 2.2 REDUZ ESTOQUE (Almoxarifado Central)
        operacoesEmLote.push(
          tx.estoqueLocal.update({
            where: { id: estoqueOrigem.id },
            data: {
              quantidade: { decrement: quantidadeSolicitada },
            },
          })
        );
        
        // 2.3 AUMENTA ESTOQUE (Farmácia Solicitante) usando upsert
        operacoesEmLote.push(
          tx.estoqueLocal.upsert({
            where: {
              medicamentoId_estabelecimentoId: {
                medicamentoId: medicamentoId,
                estabelecimentoId: solicitanteId, // Farmácia
              },
            },
            update: {
              quantidade: { increment: quantidadeSolicitada },
            },
            create: {
              medicamentoId: medicamentoId,
              estabelecimentoId: solicitanteId,
              quantidade: quantidadeSolicitada,
            },
          })
        );
        
        // 2.4 ATUALIZA ItemRequisicao (registrando que foi atendido)
        operacoesEmLote.push(
          tx.itemRequisicao.update({
            where: { id: item.id },
            data: {
              quantidadeAtendida: quantidadeSolicitada,
            },
          })
        );
        
        // **OPCIONAL:** Crie um registro na tabela 'Movimento' para rastreabilidade
        // Isso é complexo e podemos deixar para o final, mas é a prática ideal.
      }
      
      // 3. Atualiza o Status da Requisição
      operacoesEmLote.push(
        tx.requisicao.update({
          where: { id: requisicaoId },
          data: {
            status: 'ATENDIDA',
            updatedAt: new Date(),
          },
        })
      );
      
      // 4. Executa todas as operações
      await Promise.all(operacoesEmLote);
      
      // Retorna a requisição atualizada para confirmação
      return tx.requisicao.findUnique({ where: { id: requisicaoId }, include: { itens: true } });
    });
  }
}

export { AtenderRequisicaoService };