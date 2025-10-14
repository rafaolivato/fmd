// src/modules/relatorios/controllers/ListEstoqueLocalController.ts

import { Request, Response, NextFunction } from 'express';
import { ListEstoqueLocalService } from '../services/ListEstoqueLocalService';

class ListEstoqueLocalController {
  async handle(request: Request, response: Response, next: NextFunction) {
    // 1. Extrai o ID da URL (parâmetros da rota)
    const { estabelecimentoId } = request.params; 

    try {
      const listEstoqueLocalService = new ListEstoqueLocalService();

      const estoque = await listEstoqueLocalService.execute(estabelecimentoId);

      return response.json(estoque);
    } catch (error) {
      next(error);
    }
  }
}

export { ListEstoqueLocalController };