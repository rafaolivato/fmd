import { Request, Response } from 'express';
import { CreateRequisicaoService } from '../services/CreateRequisicaoService';
import { AppError } from '../../../shared/errors/AppError';

class CreateRequisicaoController {
  async handle(request: Request, response: Response) {
    // Agora só recebe itens e observacao - solicitante vem do usuário logado
    const { itens, observacao } = request.body;
    const usuarioId = (request as any).user.id;

    try {
      const createRequisicaoService = new CreateRequisicaoService();
      
      const requisicao = await createRequisicaoService.execute({
        usuarioId, 
        itens,
        observacao,
        // Não envia mais solicitanteId e atendenteId no body
      });

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