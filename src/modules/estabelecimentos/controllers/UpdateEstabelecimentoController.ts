// fmd-backend/src/modules/estabelecimentos/controllers/UpdateEstabelecimentoController.ts
import { Request, Response, NextFunction } from 'express';
import { UpdateEstabelecimentoService } from '../services/UpdateEstabelecimentoService';
import { AppError } from '../../../shared/errors/AppError';

class UpdateEstabelecimentoController {
    async handle(request: Request, response: Response, next: NextFunction) {
        const { id } = request.params; // ID da URL
        const { nome, cnes, tipo } = request.body; // Dados do corpo

        // Verifica se pelo menos um campo foi passado para atualização
        if (!nome && !cnes && !tipo) {
            throw new AppError('Nenhum dado fornecido para atualização.', 400);
        }

        try {
            const updateService = new UpdateEstabelecimentoService();
            
            const estabelecimento = await updateService.execute(id, { nome, cnes, tipo });

            // Retorna o objeto atualizado
            return response.status(200).json(estabelecimento); 
        } catch (error) {
            next(error);
        }
    }
}

export { UpdateEstabelecimentoController };