// fmd-backend/src/modules/estabelecimentos/services/FindAllEstabelecimentosService.ts
import { prisma } from '../../../database/prismaClient'; // Use o prisma importado

class FindAllEstabelecimentosService {
  async execute() {
    // Retorna todos os estabelecimentos, ordenados por nome
    const estabelecimentos = await prisma.estabelecimento.findMany({
      orderBy: { nome: 'asc' },
    });

    return estabelecimentos;
  }
}

export { FindAllEstabelecimentosService };