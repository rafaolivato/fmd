import { Request, Response, NextFunction } from 'express';
import { ListLotesProximosVencimentoService } from '../services/ListLotesProximosVencimentoService';

class ListLotesProximosVencimentoController {
  async handle(request: Request, response: Response, next: NextFunction) {
    try {
      const listLotesService = new ListLotesProximosVencimentoService();

      const lotes = await listLotesService.execute();

      return response.json(lotes);
    } catch (error) {
      next(error);
    }
  }
}

export { ListLotesProximosVencimentoController };