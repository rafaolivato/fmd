// src/modules/requisicoes/controllers/AtenderRequisicaoController.ts

import { Request, Response, NextFunction } from 'express';
import { AtenderRequisicaoService } from '../services/AtenderRequisicaoService';

class AtenderRequisicaoController {
  async handle(request: Request, response: Response, next: NextFunction) {
    // 1. Extrai o ID da Requisição da URL
    const { id } = request.params; 

    try {
      const atenderRequisicaoService = new AtenderRequisicaoService();
      
      const requisicaoAtendida = await atenderRequisicaoService.execute(id);

      // 2. Retorna a requisição atendida (Status 200 OK)
      return response.json(requisicaoAtendida);
    } catch (error) {
      next(error);
    }
  }
}

export { AtenderRequisicaoController };