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
    estoqueMinimo = 0,
    categoriaControladaId
  }: ICreateMedicamentoDTO) {
    const medicamentoJaExiste = await prisma.medicamento.findUnique({
      where: { principioAtivo },
    });

    if (medicamentoJaExiste) {
      throw new AppError('Já existe um medicamento cadastrado com este Princípio Ativo.', 409);
    }

    // Se categoriaControladaId foi fornecido, verificar se existe
    if (categoriaControladaId) {
      const categoriaExistente = await prisma.categoriaControlada.findUnique({
        where: { id: categoriaControladaId }
      });

      if (!categoriaExistente) {
        throw new AppError('Categoria controlada não encontrada.', 404);
      }
    }

    const medicamento = await prisma.medicamento.create({
      data: {
        principioAtivo,
        concentracao,
        formaFarmaceutica,
        psicotropico,
        estoqueMinimo,
        categoriaControladaId: categoriaControladaId || null
      },
      include: {
        categoriaControlada: true
      }
    });

    return medicamento;
  }
}

export { CreateMedicamentoService };