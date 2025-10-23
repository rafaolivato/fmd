import { Request, Response, NextFunction } from 'express';
import { ListAllRequisicoesService } from '../services/ListAllRequisicoesService';

export class ListAllRequisicoesController {
  async handle(request: Request, response: Response, next: NextFunction): Promise<Response | void> {
    try {
      const listAllRequisicoesService = new ListAllRequisicoesService();
      const requisicoes = await listAllRequisicoesService.execute();
      return response.json(requisicoes);
    } catch (error) {
      next(error); // Passa o erro para o middleware de erro
    }
  }
}