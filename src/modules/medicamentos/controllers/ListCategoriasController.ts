import { Request, Response } from 'express';
import { prisma } from '../../../database/prismaClient';

export class ListCategoriasController {
  async handle(request: Request, response: Response) {

    try {
      const categorias = await prisma.categoriaControlada.findMany({
        orderBy: {
          nome: 'asc'
        }
      });

      // Log das categorias encontradas
      categorias.forEach(cat => {

      });
      return response.json(categorias);

    } catch (error) {
      console.error('💥 ERRO no ListCategoriasController:', error);
      return response.status(500).json({
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}