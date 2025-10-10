// src/modules/medicamentos/services/CreateMedicamentoService.ts

import { prisma } from '../../../database/prismaClient';
import { AppError } from '../../../shared/errors/AppError';
import { ICreateMedicamentoDTO } from '../dtos/ICreateMedicamentoDTO';

class CreateMedicamentoService {
  async execute({
    principioAtivo,
    concentracao,
    formaFarmaceutica,
    psicotropico,
  }: ICreateMedicamentoDTO) {
    const medicamentoJaExiste = await prisma.medicamento.findUnique({
      where: { principioAtivo },
    });

    if (medicamentoJaExiste) {
      throw new AppError('Já existe um medicamento cadastrado com este Princípio Ativo.', 409);
    }

    const medicamento = await prisma.medicamento.create({
      data: {
        principioAtivo,
        concentracao,
        formaFarmaceutica,
        psicotropico,
      },
    });

    return medicamento;
  }
}

export { CreateMedicamentoService };