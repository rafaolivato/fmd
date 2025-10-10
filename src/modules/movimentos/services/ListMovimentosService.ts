import { prisma } from '../../../database/prismaClient';

class ListMovimentosService {
  async execute() {
    const movimentos = await prisma.movimento.findMany({
      // Inclui os itens de lote associados a cada movimento
      include: {
        itensMovimentados: {
          // Também inclui os dados do Medicamento para saber o que entrou
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
      // Ordena do mais recente para o mais antigo
      orderBy: { dataRecebimento: 'desc' }, 
    });

    return movimentos;
  }
}

export { ListMovimentosService };