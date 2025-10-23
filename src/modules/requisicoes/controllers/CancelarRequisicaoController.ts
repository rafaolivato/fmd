import { Request, Response } from 'express';
import { CancelarRequisicaoService } from '../services/CancelarRequisicaoService';
import { AppError } from '../../../shared/errors/AppError';

export class CancelarRequisicaoController {
  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const { id } = request.params;
      const usuarioId = (request as any).user.id;
      
      const cancelarRequisicaoService = new CancelarRequisicaoService();
      const requisicaoCancelada = await cancelarRequisicaoService.execute(id, usuarioId);
      
      return response.json(requisicaoCancelada);
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