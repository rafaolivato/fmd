import { prisma } from '../../../database/prismaClient';

class ListDispensacoesService {
  async execute() {
    const dispensacoes = await prisma.dispensacao.findMany({
      include: {
        itensDispensados: {
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
          estabelecimentoOrigem: {
            select: {
              id: true,
              nome: true,
            },
          },
          profissionalSaude: {
            select: {
              id: true,
              nome: true,

            },

          },
        },
        orderBy: { dataDispensacao: 'desc' },
      });

    return dispensacoes;
  }
}

export { ListDispensacoesService };