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
      fornecedorId,
      documentoTipo,
      numeroDocumento,
      dataDocumento,
      dataRecebimento,
      valorTotal,
      observacao,
    } = data;


    return await prisma.$transaction(async (tx) => {
      const estabelecimento = await tx.estabelecimento.findUnique({
        where: { id: estabelecimentoId },
      });

      if (!estabelecimento) {
        throw new AppError('Estabelecimento não encontrado.', 404);
      }

      if (fornecedorId) {
        const fornecedor = await tx.fornecedor.findUnique({
          where: { id: fornecedorId },
        });

        if (!fornecedor) {
          throw new AppError('Fornecedor não encontrado.', 404);
        }
      }

      const movimento = await tx.movimento.create({
        data: {
          tipoMovimentacao,
          fonteFinanciamento,
          fornecedorId: fornecedorId || null,
          documentoTipo,
          numeroDocumento,
          dataDocumento: new Date(dataDocumento),
          dataRecebimento: new Date(dataRecebimento),
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

        const itemMovimento = await tx.itemMovimento.create({
          data: {
            valorUnitario: item.valorUnitario,
            fabricante: item.fabricante,
            numeroLote: item.numeroLote,
            dataValidade: new Date(item.dataValidade),
            quantidade: item.quantidade,
            localizacaoFisica: item.localizacaoFisica,
            medicamentoId: item.medicamentoId,
            movimentoId: movimento.id,
          },
        });

        await tx.estoqueLote.upsert({
          where: {
            medicamentoId_estabelecimentoId_numeroLote: {
              medicamentoId: item.medicamentoId,
              estabelecimentoId: estabelecimentoId,
              numeroLote: item.numeroLote,
            },
          },

          update: {
            quantidade: { increment: item.quantidade },
            dataValidade: new Date(item.dataValidade),
            fabricante: item.fabricante,
           
          },

          create: {
            medicamentoId: item.medicamentoId,
            estabelecimentoId: estabelecimentoId,
            quantidade: item.quantidade,
            numeroLote: item.numeroLote,
            dataValidade: new Date(item.dataValidade),
            fabricante: item.fabricante,
            // Opcional: Rastreabilidade
            itemMovimentoEntradaId: itemMovimento.id,
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