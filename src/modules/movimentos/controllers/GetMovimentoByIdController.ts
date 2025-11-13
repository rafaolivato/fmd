// src/modules/movimentos/controllers/GetMovimentoByIdController.ts
import { Request, Response, NextFunction } from 'express';
import { GetMovimentoByIdService } from '../services/GetMovimentoByIdService';

class GetMovimentoByIdController {
  async handle(request: Request, response: Response, next: NextFunction) {
    const { id } = request.params;

    try {
      const getMovimentoByIdService = new GetMovimentoByIdService();
      const movimento = await getMovimentoByIdService.execute(id);

      return response.json(movimento);
    } catch (error) {
      next(error);
    }
  }
}

export { GetMovimentoByIdController };