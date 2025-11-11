// src/modules/fornecedores/controllers/ListFornecedoresController.ts
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../database/prismaClient';

class ListFornecedoresController {
  async handle(request: Request, response: Response, next: NextFunction) {
    try {
      const fornecedores = await prisma.fornecedor.findMany({
        where: { ativo: true },
        orderBy: { nome: 'asc' }
      });

      return response.json(fornecedores);
    } catch (error) {
      next(error);
    }
  }
}

export { ListFornecedoresController };