import { Request, Response, NextFunction } from 'express';
import { ListMinhasRequisicoesService } from '../services/ListMinhasRequisicoesService';
import { AppError } from '../../../shared/errors/AppError';

export class ListMinhasRequisicoesController {
   async handle(request: Request, response: Response, next: NextFunction): Promise<Response | void> {
    try {
      const usuarioId = request.user.id;
      const listMinhasRequisicoesService = new ListMinhasRequisicoesService();
      
      const requisicoes = await listMinhasRequisicoesService.execute(usuarioId);
      
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