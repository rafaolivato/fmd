import { Request, Response, NextFunction } from 'express';
import { ListEstabelecimentosService } from '../services/ListEstabelecimentosService';

class ListEstabelecimentosController {
  async handle(request: Request, response: Response, next: NextFunction) {
    try {
      const listEstabelecimentosService = new ListEstabelecimentosService();

      const estabelecimentos = await listEstabelecimentosService.execute();

      return response.json(estabelecimentos);
    } catch (error) {
      next(error);
    }
  }
}

export { ListEstabelecimentosController };