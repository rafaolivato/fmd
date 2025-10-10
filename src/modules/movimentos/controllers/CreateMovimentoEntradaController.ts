// src/modules/movimentos/controllers/CreateMovimentoEntradaController.ts

import { Request, Response, NextFunction } from 'express';
import { CreateMovimentoEntradaService } from '../services/CreateMovimentoEntradaService';

class CreateMovimentoEntradaController {
  async handle(request: Request, response: Response, next: NextFunction) {
    // O corpo da requisição é passado diretamente para o Service
    const data = request.body; 

    try {
      const createMovimentoService = new CreateMovimentoEntradaService();

      const movimento = await createMovimentoService.execute(data);

      return response.status(201).json(movimento);
    } catch (error) {
      next(error);
    }
  }
}

export { CreateMovimentoEntradaController };