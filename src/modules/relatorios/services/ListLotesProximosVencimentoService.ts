import { prisma } from '../../../database/prismaClient';

class ListLotesProximosVencimentoService {
  async execute() {
    // 1. Define o Limite de Tempo (90 dias)
    const dataLimite = new Date();
    // Adiciona 90 dias à data atual
    dataLimite.setDate(dataLimite.getDate() + 90); 

    const lotesAVencer = await prisma.itemMovimento.findMany({
      where: {
        quantidade: { gt: 0 }, // Apenas lotes com saldo
        dataValidade: {
          // Filtra datas de validade até o limite (90 dias a partir de hoje)
          lte: dataLimite, 
        },
      },
      include: {
        medicamento: {
          select: {
            principioAtivo: true,
            concentracao: true,
            id: true,
          },
        },
      },
      // Ordena pela validade mais próxima primeiro
      orderBy: { dataValidade: 'asc' }, 
    });

    return lotesAVencer;
  }
}

export { ListLotesProximosVencimentoService };