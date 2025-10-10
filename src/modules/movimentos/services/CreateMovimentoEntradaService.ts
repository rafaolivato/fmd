// src/modules/movimentos/services/CreateMovimentoEntradaService.ts - CORRIGIDO E ESTRUTURALMENTE CORRETO

import { prisma } from '../../../database/prismaClient';
import { AppError } from '../../../shared/errors/AppError';
import { ICreateMovimentoEntradaDTO } from '../dtos/ICreateMovimentoDTO';
import { Prisma } from '@prisma/client';

type PrismaTransaction = Prisma.TransactionClient; 

class CreateMovimentoEntradaService {
  async execute(data: ICreateMovimentoEntradaDTO) {
    
    // DESESTRUTURAÇÃO: Pega explicitamente cada campo do DTO
    const { 
        estabelecimentoId, 
        itens,
        tipoMovimentacao,
        fonteFinanciamento,
        fornecedor,
        documentoTipo,
        numeroDocumento,
        dataDocumento,
        dataRecebimento,
        valorTotal,
        observacao,
    } = data; 

    // 1. Inicia a transação
    const resultado = await prisma.$transaction(async (tx: PrismaTransaction) => { // <-- INÍCIO DO ESCOPO

      // A. Verifica se o estabelecimento existe
      const estabelecimento = await tx.estabelecimento.findUnique({
        where: { id: estabelecimentoId },
      });

      if (!estabelecimento) {
        throw new AppError('Estabelecimento de destino não encontrado.', 404);
      }
      
      // B. Cria o Cabeçalho do Movimento (Documento)
      const movimento = await tx.movimento.create({
        data: {
          // Campos de cabeçalho
          tipoMovimentacao,
          fonteFinanciamento,
          fornecedor,
          documentoTipo,
          numeroDocumento,
          dataDocumento,
          dataRecebimento,
          valorTotal,
          observacao,
          
          // @ts-expect-error
          estabelecimentoId: estabelecimento.id, 
        }, // <-- FECHA O OBJETO data
      }); // <-- FECHA A CHAMADA tx.movimento.create()
      
      const operacoesEmLote: Promise<any>[] = []; 
      
      // C. Processa cada item (lote)
      for (const item of itens) { 
        // 1. Verifica se o medicamento existe (é bom manter)
        const medicamento = await tx.medicamento.findUnique({
          where: { id: item.medicamentoId },
          select: { id: true },
        });

        if (!medicamento) {
          throw new AppError(`Medicamento ID ${item.medicamentoId} não encontrado.`, 404);
        }

        // 2. Cria o Lote (ItemMovimento)
        operacoesEmLote.push(
            tx.itemMovimento.create({
                data: {
                    ...item,
                    movimentoId: movimento.id,
                },
            })
        );
        
        // 3. ATUALIZA/CRIA o EstoqueLocal
        operacoesEmLote.push(
          tx.estoqueLocal.upsert({
            where: {
              medicamentoId_estabelecimentoId: {
                medicamentoId: item.medicamentoId,
                estabelecimentoId: estabelecimentoId,
              },
            },
            update: {
              quantidade: { increment: item.quantidade },
            },
            create: {
              medicamentoId: item.medicamentoId,
              estabelecimentoId: estabelecimentoId,
              quantidade: item.quantidade,
            },
          })
        );

        // 4. Atualiza o estoque total do Medicamento
        operacoesEmLote.push(
          tx.medicamento.update({
            where: { id: item.medicamentoId },
            data: {
              quantidadeEstoque: { increment: item.quantidade },
            },
          })
        );
      }
      
      // D. Executa as operações em lote
      await Promise.all(operacoesEmLote);
      
      return movimento;
    }); // <-- FECHA O ESCOPO DA TRANSAÇÃO

    return resultado;
  }
}

export { CreateMovimentoEntradaService };