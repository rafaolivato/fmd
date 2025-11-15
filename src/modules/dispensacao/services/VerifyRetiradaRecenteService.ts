import { prisma } from '../../../database/prismaClient';
import { AppError } from '../../../shared/errors/AppError';

interface IVerifyRetiradaRecenteDTO {
  pacienteCpf: string;
  medicamentoId: string;
  estabelecimentoId: string;
}

interface RetiradaRecente {
  existeRetirada: boolean;
  ultimaDispensacao?: any;
  diasDesdeUltimaRetirada?: number;
  mensagem?: string;
}

class VerifyRetiradaRecenteService {
  async execute({ pacienteCpf, medicamentoId, estabelecimentoId }: IVerifyRetiradaRecenteDTO): Promise<RetiradaRecente> {
    // Calcula a data limite (28 dias atrás)
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - 28);

    // Busca dispensações recentes do mesmo paciente e medicamento
    const dispensacoesRecentes = await prisma.dispensacao.findMany({
      where: {
        pacienteCpf: pacienteCpf,
        estabelecimentoOrigemId: estabelecimentoId,
        dataDispensacao: {
          gte: dataLimite
        },
        itensDispensados: {
          some: {
            medicamentoId: medicamentoId
          }
        }
      },
      include: {
        itensDispensados: {
          where: {
            medicamentoId: medicamentoId
          }
        }
      },
      orderBy: {
        dataDispensacao: 'desc'
      }
    });

    if (dispensacoesRecentes.length === 0) {
      return {
        existeRetirada: false
      };
    }

    const ultimaDispensacao = dispensacoesRecentes[0];
    const diasDesdeUltimaRetirada = Math.floor(
      (new Date().getTime() - ultimaDispensacao.dataDispensacao.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      existeRetirada: true,
      ultimaDispensacao,
      diasDesdeUltimaRetirada,
      mensagem: `⚠️ ALERTA: Este paciente já retirou este medicamento há ${diasDesdeUltimaRetirada} dias. Período mínimo entre retiradas: 28 dias.`
    };
  }
}

export { VerifyRetiradaRecenteService };