import { Request, Response } from 'express';
import { ListParaAtenderRequisicoesService } from '../services/ListParaAtenderRequisicoesService';
import { AppError } from '../../../shared/errors/AppError';

export class ListParaAtenderRequisicoesController {
  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const usuarioId = (request as any).user.id;
      console.log('Controller Para Atender - Usuario ID:', usuarioId);
      
      const listParaAtenderRequisicoesService = new ListParaAtenderRequisicoesService();
      const requisicoes = await listParaAtenderRequisicoesService.execute(usuarioId);
      
      return response.json(requisicoes);
    } catch (error) {
      console.error('Erro no ListParaAtenderRequisicoesController:', error);
      
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