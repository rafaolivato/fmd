// src/modules/estabelecimentos/controllers/ListEstabelecimentosSelectController.ts
import { Request, Response } from 'express';
import { prisma } from '../../../database/prismaClient';

export class ListEstabelecimentosSelectController {
  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const estabelecimentos = await prisma.estabelecimento.findMany({
        select: {
          id: true,
          nome: true,
          tipo: true,
          cnes: true
        },
        orderBy: {
          nome: 'asc'
        }
      });

      return response.json(estabelecimentos);
    } catch (error) {
      console.error('Erro ao listar estabelecimentos para select:', error);
      return response.status(500).json({ 
        error: 'Erro interno ao listar estabelecimentos' 
      });
    }
  }
}