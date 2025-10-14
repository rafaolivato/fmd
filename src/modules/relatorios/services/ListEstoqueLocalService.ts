import { prisma } from '../../../database/prismaClient';
import { AppError } from '../../../shared/errors/AppError';

class ListEstoqueLocalService {
  async execute(estabelecimentoId: string) {
    // 1. Opcional, mas bom: Verificar se o estabelecimento existe
    const estabelecimento = await prisma.estabelecimento.findUnique({
      where: { id: estabelecimentoId },
    });

    if (!estabelecimento) {
      throw new AppError('Estabelecimento não encontrado para o relatório.', 404);
    }
    
    // 2. Busca o EstoqueLocal
    // Incluímos o medicamento no retorno para sabermos o que é o ID
    const estoqueLocal = await prisma.estoqueLocal.findMany({
      where: { estabelecimentoId },
      select: {
        quantidade: true,
        updatedAt: true,
        medicamento: {
          select: {
            id: true,
            principioAtivo: true,   
            concentracao :     true,
            formaFarmaceutica: true, 
 
          },
        },
      },
    });
    
 
    return estoqueLocal;
  }
}

export { ListEstoqueLocalService };