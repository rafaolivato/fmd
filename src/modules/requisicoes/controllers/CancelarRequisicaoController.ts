import { Request, Response, NextFunction } from 'express';
import { CancelarRequisicaoService } from '../services/CancelarRequisicaoService';

export class CancelarRequisicaoController {
   async handle(request: Request, response: Response, next: NextFunction): Promise<Response | void> {
    const { id } = request.params;
    const usuarioId = request.user.id; // ID do usuário que está cancelando
    
    const cancelarRequisicaoService = new CancelarRequisicaoService();
    
    const requisicaoCancelada = await cancelarRequisicaoService.execute(id, usuarioId);
    
    return response.json(requisicaoCancelada);
  }
}