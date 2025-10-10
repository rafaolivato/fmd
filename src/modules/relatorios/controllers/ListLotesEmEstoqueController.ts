// src/modules/relatorios/controllers/ListLotesEmEstoqueController.ts
import { Request, Response, NextFunction } from 'express';
import { ListLotesEmEstoqueService } from '../services/ListLotesEmEstoqueService';

class ListLotesEmEstoqueController {
  async handle(request: Request, response: Response, next: NextFunction) {
    try {
      const listLotesService = new ListLotesEmEstoqueService();

      const lotes = await listLotesService.execute();

      return response.json(lotes);
    } catch (error) {
      next(error);
    }
  }
}

export { ListLotesEmEstoqueController };