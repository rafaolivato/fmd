// src/modules/medicamentos/controllers/DeleteMedicamentoController.ts
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../database/prismaClient';
import { AppError } from '../../../shared/errors/AppError';

class DeleteMedicamentoController {
  async handle(request: Request, response: Response, next: NextFunction) {
    const { id } = request.params;

    try {
      // Verifica se o medicamento existe
      const medicamentoExiste = await prisma.medicamento.findUnique({
        where: { id }
      });

      if (!medicamentoExiste) {
        throw new AppError('Medicamento não encontrado.', 404);
      }

      // Verifica se o medicamento tem movimentações (para evitar exclusão de dados históricos)
      const temMovimentacoes = await prisma.itemMovimento.findFirst({
        where: { medicamentoId: id }
      });

      if (temMovimentacoes) {
        throw new AppError('Não é possível excluir medicamento com histórico de movimentações.', 400);
      }

      await prisma.medicamento.delete({
        where: { id }
      });

      return response.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export { DeleteMedicamentoController };