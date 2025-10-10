// src/modules/medicamentos/controllers/CreateMedicamentoController.ts

import { Request, Response, NextFunction } from 'express';
import { CreateMedicamentoService } from '../services/CreateMedicamentoService';

class CreateMedicamentoController {
  async handle(request: Request, response: Response, next: NextFunction) {
    // Desestrutura os campos do corpo da requisição
    const {
      principioAtivo,
      concentracao,
      formaFarmaceutica,
      psicotropico,
    } = request.body;

    try {
      const createMedicamentoService = new CreateMedicamentoService();

      const medicamento = await createMedicamentoService.execute({
        principioAtivo,
        concentracao,
        formaFarmaceutica,
        psicotropico,
      });

      return response.status(201).json(medicamento);
    } catch (error) {
      next(error);
    }
  }
}

export { CreateMedicamentoController };