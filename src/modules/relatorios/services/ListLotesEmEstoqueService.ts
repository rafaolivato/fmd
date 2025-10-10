// src/modules/relatorios/services/ListLotesEmEstoqueService.ts
import { prisma } from '../../../database/prismaClient';

class ListLotesEmEstoqueService {
  async execute() {
    const lotesEmEstoque = await prisma.itemMovimento.findMany({
      where: {
        quantidade: { gt: 0 }, // Filtra apenas lotes com saldo maior que zero
      },
      // Inclui os detalhes do medicamento associado a cada lote
      include: {
        medicamento: {
          select: {
            principioAtivo: true,
            concentracao: true,
            formaFarmaceutica: true,
            id: true,
          },
        },
      },
      // ORDENAÇÃO CRUCIAL: Por validade mais antiga primeiro (FEFO)
      orderBy: { dataValidade: 'asc' }, 
    });

    return lotesEmEstoque;
  }
}

export { ListLotesEmEstoqueService };