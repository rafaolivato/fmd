import { Request, Response } from 'express';
import { ListAllRequisicoesService } from '../services/ListAllRequisicoesService';
import { AppError } from '../../../shared/errors/AppError';

export class ListAllRequisicoesController {
  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const listAllRequisicoesService = new ListAllRequisicoesService();
      const requisicoes = await listAllRequisicoesService.execute();
      
      return response.json(requisicoes);
    } catch (error) {
      if (error instanceof AppError) {
        return response.status(error.statusCode).json({
          message: error.message
        });
      }
      
      return response.status(500).json({
        message: 'Erro interno do servidor'
      });
    }
  }
}