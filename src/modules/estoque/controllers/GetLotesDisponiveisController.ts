import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../database/prismaClient';

class GetLotesDisponiveisController {
  async handle(request: Request, response: Response, next: NextFunction) {
    try {
      const { medicamentoId, estabelecimentoId } = request.query;

      if (!medicamentoId || !estabelecimentoId) {
        return response.status(400).json({
          error: 'medicamentoId e estabelecimentoId são obrigatórios'
        });
      }

      const lotes = await prisma.estoqueLote.findMany({
        where: {
          medicamentoId: medicamentoId as string,
          estabelecimentoId: estabelecimentoId as string,
          quantidade: { gt: 0 } // Apenas lotes com estoque disponível
        },
        orderBy: {
          dataValidade: 'asc' // FIFO - vence primeiro
        }
      });

      return response.json(lotes);
    } catch (error) {
      next(error);
    }
  }
}

export { GetLotesDisponiveisController };