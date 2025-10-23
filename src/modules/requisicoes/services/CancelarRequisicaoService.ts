import { prisma } from '../../../database/prismaClient';
import { AppError } from '../../../shared/errors/AppError';

export class CancelarRequisicaoService {
  async execute(requisicaoId: string, usuarioId: string) {
    return await prisma.$transaction(async (tx) => {
      // Busca a requisição
      const requisicao = await tx.requisicao.findUnique({
        where: { id: requisicaoId },
        include: {
          itens: true
        }
      });

      if (!requisicao) {
        throw new AppError('Requisição não encontrada', 404);
      }

      // Verifica se o usuário é o solicitante
      if (requisicao.solicitanteId !== usuarioId) {
        throw new AppError('Você só pode cancelar suas próprias requisições', 403);
      }

      // Verifica se já foi atendida
      if (requisicao.status === 'ATENDIDA' || requisicao.status === 'EM_SEPARACAO') {
        throw new AppError('Não é possível cancelar uma requisição em andamento ou atendida', 400);
      }

      // Verifica se já está cancelada
      if (requisicao.status === 'CANCELADA') {
        throw new AppError('Requisição já está cancelada', 400);
      }

      // Atualiza para cancelada
      const requisicaoCancelada = await tx.requisicao.update({
        where: { id: requisicaoId },
        data: {
          status: 'CANCELADA',
          updatedAt: new Date()
        },
        include: {
          solicitante: {
            select: {
              id: true,
              nome: true,
              tipo: true
            }
          },
          atendente: {
            select: {
              id: true,
              nome: true,
              tipo: true
            }
          },
          itens: {
            include: {
              medicamento: true
            }
          }
        }
      });

      return requisicaoCancelada;
    });
  }
}