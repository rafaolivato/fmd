import { prisma } from '../../../database/prismaClient';

class ListEstabelecimentosService {
  async execute() {
    const estabelecimentos = await prisma.estabelecimento.findMany({
      
      orderBy: { nome: 'asc' }, 
    });

    return estabelecimentos;
  }
}

export { ListEstabelecimentosService };