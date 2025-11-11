import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../database/prismaClient';
import { AppError } from '../../../shared/errors/AppError';

class UpdatePacienteController {
  async handle(request: Request, response: Response, next: NextFunction) {
    const { id } = request.params;
    const { nome, cpf, dataNascimento, endereco } = request.body;

    try {
      // Verificar se o paciente existe
      const pacienteExistente = await prisma.paciente.findUnique({
        where: { id }
      });

      if (!pacienteExistente) {
        throw new AppError('Paciente não encontrado.', 404);
      }

      // Verificar se o CPF já está em uso por outro paciente
      if (cpf !== pacienteExistente.cpf) {
        const cpfEmUso = await prisma.paciente.findUnique({
          where: { cpf }
        });

        if (cpfEmUso) {
          throw new AppError('Já existe um paciente cadastrado com este CPF.', 409);
        }
      }

      // Atualizar o paciente
      const pacienteAtualizado = await prisma.paciente.update({
        where: { id },
        data: {
          nome,
          cpf,
          dataNascimento: new Date(dataNascimento + 'T00:00:00'), 
          endereco
        }
      });

      return response.json(pacienteAtualizado);
    } catch (error) {
      next(error);
    }
  }
}

export { UpdatePacienteController };