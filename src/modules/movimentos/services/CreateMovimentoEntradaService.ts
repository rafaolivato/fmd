import { PrismaClient } from '@prisma/client';
import { AppError } from '../../../shared/errors/AppError';
import { ICreateMovimentoEntradaDTO } from '../dtos/ICreateMovimentoDTO';

const prisma = new PrismaClient();

class CreateMovimentoEntradaService {
  async execute(data: ICreateMovimentoEntradaDTO) {
    
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

    // REMOVA a tipagem da transação e deixe o TypeScript inferir
    return await prisma.$transaction(async (tx) => {
      const estabelecimento = await tx.estabelecimento.findUnique({
        where: { id: estabelecimentoId },
      });

      if (!estabelecimento) {
        throw new AppError('Estabelecimento não encontrado.', 404);
      }
      
      const movimento = await tx.movimento.create({
        data: {
          tipoMovimentacao,
          fonteFinanciamento,
          fornecedor,
          documentoTipo,
          numeroDocumento,
          dataDocumento,
          dataRecebimento,
          valorTotal,
          observacao,
          estabelecimentoId,
        },
      });

      for (const item of itens) {
        const medicamento = await tx.medicamento.findUnique({
          where: { id: item.medicamentoId },
        });

        if (!medicamento) {
          throw new AppError(`Medicamento não encontrado: ${item.medicamentoId}`, 404);
        }

        await tx.itemMovimento.create({
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
        });
        
        await tx.estoqueLocal.upsert({
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
        });

        await tx.medicamento.update({
          where: { id: item.medicamentoId },
          data: {
            quantidadeEstoque: { increment: item.quantidade },
          },
        });
      }
      
      return movimento;
    });
  }
}

export { CreateMovimentoEntradaService };