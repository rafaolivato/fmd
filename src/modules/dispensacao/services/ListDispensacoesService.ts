// src/modules/dispensacao/services/ListDispensacoesService.ts
import { prisma } from '../../../database/prismaClient';

class ListDispensacoesService {
  async execute() {
    const dispensacoes = await prisma.dispensacao.findMany({
      // Inclui os itens de dispensação associados a cada documento
      include: {
        itensDispensados: {
          // Inclui os dados do Medicamento para saber o que saiu
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
      

       estabelecimentoOrigem: { // ← ADICIONE ESTE INCLUDE
          select: {
            id: true,
            nome: true,
          },
        },
      },
      // Ordena do mais recente para o mais antigo
      orderBy: { dataDispensacao: 'desc' }, 
    });



    return dispensacoes;
  }
}

export { ListDispensacoesService };