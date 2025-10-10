// src/modules/movimentos/services/CreateMovimentoEntradaService.ts - CORRIGIDO FINALMENTE

import { prisma } from '../../../database/prismaClient';
import { AppError } from '../../../shared/errors/AppError';
import { ICreateMovimentoDTO } from '../dtos/ICreateMovimentoDTO';
import { Prisma } from '@prisma/client'; 

// O tipo da transação é o único tipo complexo que precisamos manter
type PrismaTransaction = Prisma.TransactionClient; 

class CreateMovimentoEntradaService {
  async execute(data: ICreateMovimentoDTO) {
    // 1. Verifica se o documento (ex: Nota Fiscal) já foi registrado
    const documentoJaExiste = await prisma.movimento.findUnique({
      where: { numeroDocumento: data.numeroDocumento },
    });

    if (documentoJaExiste) {
      throw new AppError('Este número de documento já foi registrado em uma movimentação.', 409);
    }

    // 2. Realiza a transação para garantir atomicidade
    // Usando PrismaTransaction para garantir que 'tx' tem todos os models
    const resultado = await prisma.$transaction(async (tx: PrismaTransaction) => {
      
      
      // A. Cria o Cabeçalho da Movimentação
      const movimento = await tx.movimento.create({
        data: {
          tipoMovimentacao: data.tipoMovimentacao,
          fonteFinanciamento: data.fonteFinanciamento,
          fornecedor: data.fornecedor,
          documentoTipo: data.documentoTipo,
          numeroDocumento: data.numeroDocumento,
          dataDocumento: data.dataDocumento,
          dataRecebimento: data.dataRecebimento,
          valorTotal: data.valorTotal,
          observacao: data.observacao,
        },
      });

      // B. Simplificação total da tipagem dos arrays
      // Usaremos um Array de Promises de forma genérica para evitar erros de inferência
      const operacoesEmLote: Promise<any>[] = []; 
      
      for (const item of data.itens) {
        if (item.quantidade <= 0) {
          throw new AppError(`A quantidade de entrada para o item ${item.medicamentoId} deve ser positiva.`, 400);
        }
        
        // 1. Cria o ItemMovimento
        operacoesEmLote.push(
          tx.itemMovimento.create({
            data: {
              valorUnitario: item.valorUnitario,
              fabricante: item.fabricante,
              numeroLote: item.numeroLote,
              dataValidade: item.dataValidade,
              quantidade: item.quantidade,
              localizacaoFisica: item.localizacaoFisica,
              medicamentoId: item.medicamentoId,
              movimentoId: movimento.id,
            },
          })
        );
        
        // 2. ATUALIZA O ESTOQUE total do Medicamento
        operacoesEmLote.push(
          tx.medicamento.update({
            where: { id: item.medicamentoId },
            data: {
              quantidadeEstoque: {
                increment: item.quantidade,
              },
            },
          })
        );
      }
      
      // C. Executa todas as operações em paralelo
      await Promise.all(operacoesEmLote);

      return movimento;
    });

    return resultado;
  }
}

export { CreateMovimentoEntradaService };