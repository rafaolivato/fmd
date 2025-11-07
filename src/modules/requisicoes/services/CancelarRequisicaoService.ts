import { prisma } from '../../../database/prismaClient';
import { AppError } from '../../../shared/errors/AppError';

export class CancelarRequisicaoService {
  async execute(requisicaoId: string, usuarioId: string) {
    return await prisma.$transaction(async (tx) => {
      // Busca a requisição com relações
      const requisicao = await tx.requisicao.findUnique({
        where: { id: requisicaoId },
        include: {
          itens: true,
          solicitante: true,
          atendente: true
        }
      });

      if (!requisicao) {
        throw new AppError('Requisição não encontrada', 404);
      }

      // Busca o usuário para verificar seu estabelecimento
      const usuario = await tx.user.findUnique({
        where: { id: usuarioId },
        include: { estabelecimento: true }
      });

      if (!usuario || !usuario.estabelecimentoId) {
        throw new AppError('Usuário não vinculado a nenhum estabelecimento', 400);
      }

      // ✅ NOVA REGRA: Verifica se o usuário é o SOLICITANTE ou o ATENDENTE
      const isSolicitante = requisicao.solicitanteId === usuario.estabelecimentoId;
      const isAtendente = requisicao.atendenteId === usuario.estabelecimentoId;

      if (!isSolicitante && !isAtendente) {
        throw new AppError('Você só pode cancelar requisições do seu estabelecimento', 403);
      }

      // Verifica se já foi atendida
      if (requisicao.status === 'ATENDIDA' || requisicao.status === 'ATENDIDA_PARCIALMENTE') {
        throw new AppError('Não é possível cancelar uma requisição já atendida', 400);
      }

      // Verifica se já está cancelada
      if (requisicao.status === 'CANCELADA') {
        throw new AppError('Requisição já está cancelada', 400);
      }

      // ✅ Diferentes mensagens baseadas em quem está cancelando
      let observacao = '';

      if (isSolicitante) {
        observacao = 'Cancelado pelo solicitante';
      } else if (isAtendente) {
        observacao = 'Cancelado pelo almoxarifado - Motivo: sem estoque/indisponibilidade';
      }

      // Atualiza para cancelada
      const requisicaoCancelada = await tx.requisicao.update({
        where: { id: requisicaoId },
        data: {
          status: 'CANCELADA',
          updatedAt: new Date(),
          observacoes: requisicao.observacoes 
            ? `${requisicao.observacoes} | ${observacao}`
            : observacao
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