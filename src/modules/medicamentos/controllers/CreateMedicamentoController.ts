import { Request, Response, NextFunction } from 'express';
import { CreateMedicamentoService } from '../services/CreateMedicamentoService';

class CreateMedicamentoController {
  async handle(request: Request, response: Response, next: NextFunction) {
    const {
      principioAtivo,
      concentracao,
      formaFarmaceutica,
      psicotropico,
      estoqueMinimo,
      categoriaControladaId
    } = request.body;

    try {
      const createMedicamentoService = new CreateMedicamentoService();

      const medicamento = await createMedicamentoService.execute({
        principioAtivo,
        concentracao,
        formaFarmaceutica,
        psicotropico,
        estoqueMinimo,
        categoriaControladaId
      });

      return response.status(201).json(medicamento);
    } catch (error) {
      next(error);
    }
  }
}

export { CreateMedicamentoController };