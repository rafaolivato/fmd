// src/modules/pacientes/controllers/ListPacientesController.ts
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../database/prismaClient';

class ListPacientesController {
  async handle(request: Request, response: Response, next: NextFunction) {
    try {
      const pacientes = await prisma.paciente.findMany({
        orderBy: {
          nome: 'asc'
        }
      });

      return response.json(pacientes);
    } catch (error) {
      next(error);
    }
  }
}

export { ListPacientesController };