// src/modules/estoque/controllers/GetEstoqueMedicamentoController.ts
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../database/prismaClient';
import { AppError } from '../../../shared/errors/AppError';

class GetEstoqueMedicamentoController {
  async handle(request: Request, response: Response, next: NextFunction) {
    const { medicamentoId, estabelecimentoId } = request.params;

    try {
      // Verificar se o medicamento existe
      const medicamento = await prisma.medicamento.findUnique({
        where: { id: medicamentoId }
      });

      if (!medicamento) {
        throw new AppError('Medicamento não encontrado', 404);
      }

      // Verificar se o estabelecimento existe
      const estabelecimento = await prisma.estabelecimento.findUnique({
        where: { id: estabelecimentoId }
      });

      if (!estabelecimento) {
        throw new AppError('Estabelecimento não encontrado', 404);
      }

      // Buscar o estoque
      const estoque = await prisma.estoqueLocal.findUnique({
        where: {
          medicamentoId_estabelecimentoId: {
            medicamentoId,
            estabelecimentoId
          }
        }
      });

      // Se não encontrou, retorna 0 (em vez de erro)
      return response.json({ 
        quantidade: estoque?.quantidade || 0,
        medicamento: {
          principioAtivo: medicamento.principioAtivo,
          concentracao: medicamento.concentracao
        }
      });

    } catch (error) {
      next(error);
    }
  }
}

export { GetEstoqueMedicamentoController };