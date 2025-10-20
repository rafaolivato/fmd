// src/modules/medicamentos/controllers/GetAllMedicamentosController.ts
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../database/prismaClient';

class GetAllMedicamentosController {
  async handle(request: Request, response: Response, next: NextFunction) {
    try {
      const medicamentos = await prisma.medicamento.findMany({
        orderBy: {
          principioAtivo: 'asc'
        }
      });

      return response.json(medicamentos);
    } catch (error) {
      next(error);
    }
  }
}

export { GetAllMedicamentosController };