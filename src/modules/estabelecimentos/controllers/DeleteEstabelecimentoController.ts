// fmd-backend/src/modules/estabelecimentos/controllers/DeleteEstabelecimentoController.ts
import { Request, Response, NextFunction } from 'express';
import { DeleteEstabelecimentoService } from '../services/DeleteEstabelecimentoService';

class DeleteEstabelecimentoController {
    async handle(request: Request, response: Response, next: NextFunction) {
        const { id } = request.params; // Pega o ID da URL

        try {
            const deleteService = new DeleteEstabelecimentoService();
            await deleteService.execute(id);

            // Retorna 204 No Content (padrão para exclusão bem-sucedida sem retorno de corpo)
            return response.status(204).send(); 
        } catch (error) {
            next(error);
        }
    }
}

export { DeleteEstabelecimentoController };