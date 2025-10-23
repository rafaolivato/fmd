import { prisma } from '../../../database/prismaClient';

export class ListAllRequisicoesService {
  async execute() {
    const requisicoes = await prisma.requisicao.findMany({
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