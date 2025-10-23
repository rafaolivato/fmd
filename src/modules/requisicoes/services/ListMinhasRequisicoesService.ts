import { prisma } from '../../../database/prismaClient';
import { AppError } from '../../../shared/errors/AppError';

export class ListMinhasRequisicoesService {
  async execute(usuarioId: string) {
    console.log('=== DEBUG ListMinhasRequisicoesService ===');
    console.log('Usuario ID recebido:', usuarioId);

    try {
      // Busca o usuário com o estabelecimento usando select
      const usuario = await prisma.user.findUnique({
        where: { id: usuarioId },
        select: {
          id: true,
          email: true,
          name: true,
          estabelecimentoId: true,
          estabelecimento: {
            select: {
              id: true,
              nome: true,
              tipo: true
            }
          }
        }
      });

      console.log('DEBUG - Usuário encontrado:', usuario);

      if (!usuario || !usuario.estabelecimentoId) {
        console.log('ERRO: Usuário sem estabelecimento');
        throw new AppError('Usuário não vinculado a nenhum estabelecimento', 400);
      }

      console.log('Buscando requisições para estabelecimento:', usuario.estabelecimentoId);

      const requisicoes = await prisma.requisicao.findMany({
        where: {
          solicitanteId: usuario.estabelecimentoId
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

      console.log('DEBUG - Requisições encontradas:', requisicoes.length);
      console.log('=== FIM DEBUG ListMinhasRequisicoesService ===');

      return requisicoes;

    } catch (error) {
      console.error('ERRO no ListMinhasRequisicoesService:', error);
      throw error; // Re-lança o erro para o controller capturar
    }
  }
}