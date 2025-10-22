import { Request, Response, NextFunction } from 'express';
import { ListMovimentosService } from '../services/ListMovimentosService';

class ListMovimentosController {
  async handle(request: Request, response: Response, next: NextFunction) {
    try {
      const listMovimentosService = new ListMovimentosService();

      const movimentos = await listMovimentosService.execute();

      return response.json(movimentos);
    } catch (error) {
      next(error);
    }
  }
}

export { ListMovimentosController };