import { prisma } from '../../../database/prismaClient';
import { AppError } from '../../../shared/errors/AppError';

interface IItemRequisicao {
  medicamentoId: string;
  quantidadeSolicitada: number;
}

interface ICreateRequisicaoDTO {
  usuarioId: string;
  itens: IItemRequisicao[];
  observacao?: string;
}

export class CreateRequisicaoService {
  async execute({ usuarioId, itens, observacao }: ICreateRequisicaoDTO) {
    // Busca o estabelecimento do usuário logado (solicitante)
    const usuario = await prisma.user.findUnique({
      where: { id: usuarioId },
      include: { estabelecimento: true }
    });

    if (!usuario || !usuario.estabelecimentoId) {
      throw new AppError('Usuário não vinculado a nenhum estabelecimento', 400);
    }

    // Encontra um almoxarifado para atender (sempre almoxarifado)
    const almoxarifado = await prisma.estabelecimento.findFirst({
      where: {
        tipo: 'ALMOXARIFADO'
      }
    });

    if (!almoxarifado) {
      throw new AppError('Nenhum almoxarifado disponível para atender requisições', 400);
    }

    return await prisma.$transaction(async (tx) => {
      // Cria a requisição - CORREÇÃO: Garantir que os IDs são strings válidas
      const requisicao = await tx.requisicao.create({
        data: {
          solicitanteId: usuario.estabelecimentoId!, // Use ! para garantir que não é null
          atendenteId: almoxarifado.id,
          status: 'PENDENTE',
          observacoes: observacao || null,
          itens: {
            create: itens.map(item => ({
              medicamentoId: item.medicamentoId,
              quantidadeSolicitada: item.quantidadeSolicitada,
              quantidadeAtendida: 0
            }))
          }
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

      return requisicao;
    });
  }
}