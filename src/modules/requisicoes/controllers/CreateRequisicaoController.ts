import { Request, Response } from 'express';
import { CreateRequisicaoService } from '../services/CreateRequisicaoService';
import { ICreateRequisicaoDTO } from '../dtos/ICreateRequisicaoDTO';
import { AppError } from '../../../shared/errors/AppError';

class CreateRequisicaoController {
  async handle(request: Request, response: Response) {
    // 1. Extrai todos os dados necessários do corpo da requisição
    const { 
      solicitanteId, 
      atendenteId, 
      itens, 
      observacao 
    } = request.body as ICreateRequisicaoDTO;

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
      console.error('Erro no CreateRequisicaoController:', error);
      
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

export { CreateRequisicaoController };