import { Request, Response } from 'express';
import { ListMinhasRequisicoesService } from '../services/ListMinhasRequisicoesService';
import { AppError } from '../../../shared/errors/AppError';

// Mude de export class para export default ou ajuste o export
export class ListMinhasRequisicoesController {
  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const usuarioId = (request as any).user.id;
      console.log('Controller - Usuario ID:', usuarioId);
      
      const listMinhasRequisicoesService = new ListMinhasRequisicoesService();
      const requisicoes = await listMinhasRequisicoesService.execute(usuarioId);
      
      return response.json(requisicoes);
    } catch (error) {
      console.error('Erro no ListMinhasRequisicoesController:', error);
      
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