import { Request, Response, NextFunction } from 'express';
import { CreateMovimentoSaidaService } from '../services/CreateMovimentoSaidaService';

class CreateMovimentoSaidaController {
    async handle(request: Request, response: Response, next: NextFunction) {

        const {
            estabelecimentoId,
            itens,
            tipoMovimentacao,
            documentoReferencia,
            dataMovimento,
            justificativa,
            observacao
        } = request.body;

        try {
            const createMovimentoSaidaService = new CreateMovimentoSaidaService();

            const saida = await createMovimentoSaidaService.execute({
                estabelecimentoId,
                itens,
                tipoMovimentacao,
                documentoReferencia,
                dataMovimento,
                justificativa,
                observacao

            });

            return response.status(201).json(saida);
        } catch (error) {
            next(error);
        }
    }
}

export { CreateMovimentoSaidaController };