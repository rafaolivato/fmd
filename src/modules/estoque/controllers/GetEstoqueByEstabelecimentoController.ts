import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../database/prismaClient';

class GetEstoqueByEstabelecimentoController {
  async handle(request: Request, response: Response, next: NextFunction) {
    const { estabelecimentoId } = request.params;

    try {
      const estoque = await prisma.estoqueLocal.findMany({
        where: { estabelecimentoId },
        include: {
          medicamento: {
            select: {
              principioAtivo: true,
              concentracao: true,
              formaFarmaceutica: true
            }
          }
        }
      });

      return response.json(estoque);
    } catch (error) {
      next(error);
    }
  }
}

export { GetEstoqueByEstabelecimentoController };