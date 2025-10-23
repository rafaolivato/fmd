import { prisma } from '../../../database/prismaClient';
import { AppError } from '../../../shared/errors/AppError';

export class ListParaAtenderRequisicoesService {
  async execute(usuarioId: string) {
    // Busca o estabelecimento do usuário
    const usuario = await prisma.user.findUnique({
      where: { id: usuarioId },
      include: { estabelecimento: true }
    });

    if (!usuario || !usuario.estabelecimentoId) {
      throw new AppError('Usuário não vinculado a nenhum estabelecimento', 400);
    }

    // Verifica se o estabelecimento é um ALMOXARIFADO
    const estabelecimento = await prisma.estabelecimento.findUnique({
      where: { id: usuario.estabelecimentoId }
    });

    if (estabelecimento?.tipo !== 'ALMOXARIFADO') {
      throw new AppError('Apenas almoxarifados podem atender requisições', 403);
    }

    const requisicoes = await prisma.requisicao.findMany({
      where: {
        atendenteId: usuario.estabelecimentoId,
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