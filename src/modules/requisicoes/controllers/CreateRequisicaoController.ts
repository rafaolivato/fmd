import { Request, Response, NextFunction } from 'express';
import { CreateRequisicaoService } from '../services/CreateRequisicaoService';
import { ICreateRequisicaoDTO } from '../dtos/ICreateRequisicaoDTO';

class CreateRequisicaoController {
  async handle(request: Request, response: Response, next: NextFunction) {
    // 1. Extrai todos os dados necessários do corpo da requisição
    const { 
      solicitanteId, 
      atendenteId, 
      itens, 
      observacao 
    } = request.body as ICreateRequisicaoDTO; // Usamos o DTO para tipagem

    try {
      const createRequisicaoService = new CreateRequisicaoService();
      
      const requisicao = await createRequisicaoService.execute({
        solicitanteId,
        atendenteId,
        itens,
        observacao,
      });

      // Retorna o cabeçalho da requisição criada
      return response.status(201).json(requisicao);
    } catch (error) {
      next(error);
    }
  }
}

export { CreateRequisicaoController };