import { Request, Response } from 'express';
import { AtenderRequisicaoService } from '../services/AtenderRequisicaoService';
import { AppError } from '../../../shared/errors/AppError';

class AtenderRequisicaoController {
  async handle(request: Request, response: Response) {
    const { id } = request.params;
    const { itens } = request.body; // Mudei de itensAtendidos para itens

    console.log('📋 AtenderRequisicaoController - Dados recebidos:', {
      requisicaoId: id,
      itens: itens
    });

    try {
      const atenderRequisicaoService = new AtenderRequisicaoService();
      
      const requisicaoAtendida = await atenderRequisicaoService.execute(
        id, 
        itens // Agora passando 'itens' em vez de 'itensAtendidos'
      );

  

      return response.json(requisicaoAtendida);

    } catch (error) {
      console.error('❌ Erro no AtenderRequisicaoController:', error);
      
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

export { AtenderRequisicaoController };