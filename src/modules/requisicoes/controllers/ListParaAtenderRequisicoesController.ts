import { Request, Response, NextFunction } from 'express';
import { ListParaAtenderRequisicoesService } from '../services/ListParaAtenderRequisicoesService';

export class ListParaAtenderRequisicoesController {
   async handle(request: Request, response: Response, next: NextFunction): Promise<Response | void> {
    const usuarioId = request.user.id; // ID do usuário logado
    const listParaAtenderRequisicoesService = new ListParaAtenderRequisicoesService();
    
    const requisicoes = await listParaAtenderRequisicoesService.execute(usuarioId);
    
    return response.json(requisicoes);
  }
}