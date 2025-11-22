import { prisma } from '../../../database/prismaClient';

interface Request {
  estabelecimentoId: string;
}

class ListMedicamentosComEstoqueService {
  async execute({ estabelecimentoId }: Request) {
    try {
      const medicamentos = await prisma.medicamento.findMany({
        where: {
          estoqueLocal: {
            some: {
              estabelecimentoId: estabelecimentoId,
              quantidade: { gt: 0 }
            }
          }
        },
        include: {
          estoqueLocal: {
            where: {
              estabelecimentoId: estabelecimentoId
            },
            select: {
              quantidade: true
            }
          }
        },
        orderBy: {
          principioAtivo: 'asc'
        }
      });

      const medicamentosFormatados = medicamentos.map(med => ({
        id: med.id,
        principioAtivo: med.principioAtivo,
        concentracao: med.concentracao,
        formaFarmaceutica: med.formaFarmaceutica,
        psicotropico: med.psicotropico,
        quantidadeEstoque: med.quantidadeEstoque,
        estoqueMinimo: med.estoqueMinimo,
        createdAt: med.createdAt,
        updatedAt: med.updatedAt,
        estoqueDisponivel: med.estoqueLocal[0]?.quantidade || 0
      }));

      return medicamentosFormatados;

    } catch (error) {
      console.error('Erro ao listar medicamentos com estoque:', error);
      throw new Error('Erro ao buscar medicamentos com estoque');
    }
  }
}

export { ListMedicamentosComEstoqueService };