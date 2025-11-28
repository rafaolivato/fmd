// src/modules/medicamentos/controllers/ListCategoriasController.ts
import { Request, Response } from 'express';
import { prisma } from '../../../database/prismaClient';
import { AppError } from '../../../shared/errors/AppError';

class ListCategoriasController {
  async handle(request: Request, response: Response) {
    try {
      const categorias = await prisma.categoriaControlada.findMany({
        orderBy: {
          nome: 'asc'
        }
      });

      return response.json(categorias);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      throw new AppError('Erro interno do servidor', 500);
    }
  }
}

export { ListCategoriasController };