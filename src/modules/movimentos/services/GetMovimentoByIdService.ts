// src/modules/movimentos/services/GetMovimentoByIdService.ts
import { prisma } from '../../../database/prismaClient';
import { AppError } from '../../../shared/errors/AppError';

class GetMovimentoByIdService {
  async execute(id: string) {
    const movimento = await prisma.movimento.findUnique({
      where: { id },
      include: {
        itensMovimentados: {
          include: {
            medicamento: {
              select: {
                principioAtivo: true,
                concentracao: true,
                formaFarmaceutica: true,
              },
            },
          },
        },
      },
    });

    if (!movimento) {
      throw new AppError('Movimento não encontrado', 404);
    }

    return movimento;
  }
}

export { GetMovimentoByIdService };