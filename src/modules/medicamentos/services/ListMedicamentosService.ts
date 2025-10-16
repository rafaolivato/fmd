import { prisma } from '../../../database/prismaClient';

class ListMedicamentosService {
  async execute() {
    const medicamentos = await prisma.medicamento.findMany({
      // Ordena por princípio ativo para melhor visualização
      orderBy: { principioAtivo: 'asc' }, 
    });

    return medicamentos;
  }
}

export { ListMedicamentosService };