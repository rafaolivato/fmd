import { Request, Response, NextFunction } from 'express';
import { CreateEstabelecimentoService } from '../services/CreateEstabelecimentoService';

class CreateEstabelecimentoController {
    async handle(request: Request, response: Response, next: NextFunction) {
        const { nome, cnes, tipo } = request.body;

        try {
            const createEstabelecimentoService = new CreateEstabelecimentoService();
            const estabelecimento = await createEstabelecimentoService.execute({ nome, cnes, tipo });

            return response.status(201).json(estabelecimento);
        } catch (error) {
            next(error);
        }
    }
}

export { CreateEstabelecimentoController };