import { Request, Response, NextFunction } from 'express';
import { ListDispensacoesService } from '../services/ListDispensacoesService';

class ListDispensacoesController {
  async handle(request: Request, response: Response, next: NextFunction) {
    try {
      const listDispensacoesService = new ListDispensacoesService();

      const dispensacoes = await listDispensacoesService.execute();

      return response.json(dispensacoes);
    } catch (error) {
      next(error);
    }
  }
}

export { ListDispensacoesController };