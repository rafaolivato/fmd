import { prisma } from '../../../database/prismaClient';
import { AppError } from '../../../shared/errors/AppError';

export class ListMinhasRequisicoesService {
  async execute(usuarioId: string) {
    // Busca requisições onde o usuário é o solicitante
    const requisicoes = await prisma.requisicao.findMany({
      where: {
        solicitanteId: usuarioId // Agora usando diretamente o ID do usuário
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
      },
      orderBy: {
        dataSolicitacao: 'desc'
      }
    });

    return requisicoes;
  }
}