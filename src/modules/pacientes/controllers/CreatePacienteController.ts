// src/modules/pacientes/controllers/CreatePacienteController.ts
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../database/prismaClient';
import { AppError } from '../../../shared/errors/AppError';

class CreatePacienteController {
  async handle(request: Request, response: Response, next: NextFunction) {
    const { nome, cpf, dataNascimento, endereco } = request.body;

    try {
      // Verificar se CPF já existe
      const pacienteExistente = await prisma.paciente.findUnique({
        where: { cpf }
      });

      if (pacienteExistente) {
        throw new AppError('Já existe um paciente cadastrado com este CPF.', 409);
      }

      const paciente = await prisma.paciente.create({
        data: {
          nome,
          cpf,
          dataNascimento: new Date(dataNascimento + 'T00:00:00'), 
          endereco
        }
      });

      return response.status(201).json(paciente);
    } catch (error) {
      next(error);
    }
  }
}

export { CreatePacienteController };