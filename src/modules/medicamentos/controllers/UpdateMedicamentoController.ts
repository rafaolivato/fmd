// src/modules/medicamentos/controllers/UpdateMedicamentoController.ts
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../database/prismaClient';
import { AppError } from '../../../shared/errors/AppError';

class UpdateMedicamentoController {
  async handle(request: Request, response: Response, next: NextFunction) {
    const { id } = request.params;
    const {
      principioAtivo,
      concentracao,
      formaFarmaceutica,
      psicotropico,
    } = request.body;

    try {
      // Verifica se o medicamento existe
      const medicamentoExiste = await prisma.medicamento.findUnique({
        where: { id }
      });

      if (!medicamentoExiste) {
        throw new AppError('Medicamento não encontrado.', 404);
      }

      // Verifica se outro medicamento já usa este princípio ativo
      if (principioAtivo !== medicamentoExiste.principioAtivo) {
        const principioAtivoEmUso = await prisma.medicamento.findUnique({
          where: { principioAtivo }
        });

        if (principioAtivoEmUso) {
          throw new AppError('Já existe um medicamento cadastrado com este Princípio Ativo.', 409);
        }
      }

      const medicamento = await prisma.medicamento.update({
        where: { id },
        data: {
          principioAtivo,
          concentracao,
          formaFarmaceutica,
          psicotropico,
        },
      });

      return response.json(medicamento);
    } catch (error) {
      next(error);
    }
  }
}

export { UpdateMedicamentoController };