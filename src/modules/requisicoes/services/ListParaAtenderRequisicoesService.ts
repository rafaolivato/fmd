import { prisma } from '../../../database/prismaClient';
import { AppError } from '../../../shared/errors/AppError';

export class ListParaAtenderRequisicoesService {
  async execute(usuarioId: string) {
    // Busca requisições onde o usuário é o atendente
    const requisicoes = await prisma.requisicao.findMany({
      where: {
        atendenteId: usuarioId, // Agora usando diretamente o ID do usuário
        status: 'PENDENTE'
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