// src/modules/requisicoes/controllers/AtenderRequisicaoController.ts

import { Request, Response, NextFunction } from 'express';
import { AtenderRequisicaoService } from '../services/AtenderRequisicaoService';
import { IAtendimentoRequisicaoDTO } from '../dtos/IAtendimentoRequisicaoDTO';

class AtenderRequisicaoController {
  async handle(request: Request, response: Response, next: NextFunction) {
    // 1. Extrai o ID da Requisição da URL
    const { id } = request.params; 
    const { itensAtendidos } = request.body as IAtendimentoRequisicaoDTO;

    try {
      const atenderRequisicaoService = new AtenderRequisicaoService();
      
      const requisicaoAtendida = await atenderRequisicaoService.execute(
        id,
        itensAtendidos
      );

      // 2. Retorna a requisição atendida (Status 200 OK)
      return response.json(requisicaoAtendida);
    } catch (error) {
      next(error);
    }
  }
}

export { AtenderRequisicaoController };