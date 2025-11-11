import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../database/prismaClient';
import { AppError } from '../../../shared/errors/AppError';

class DeletePacienteController {
  async handle(request: Request, response: Response, next: NextFunction) {
    const { id } = request.params;

    try {
      // Verificar se o paciente existe
      const pacienteExistente = await prisma.paciente.findUnique({
        where: { id }
      });

      if (!pacienteExistente) {
        throw new AppError('Paciente não encontrado.', 404);
      }

      // Excluir o paciente
      await prisma.paciente.delete({
        where: { id }
      });

      return response.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export { DeletePacienteController };