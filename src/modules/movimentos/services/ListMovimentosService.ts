import { prisma } from '../../../database/prismaClient';

class ListMovimentosService {
  async execute() {
    const movimentos = await prisma.movimento.findMany({
      
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
      // Ordena do mais recente para o mais antigo
      orderBy: { dataRecebimento: 'desc' }, 
    });

    

    return movimentos;
  }
}

export { ListMovimentosService };