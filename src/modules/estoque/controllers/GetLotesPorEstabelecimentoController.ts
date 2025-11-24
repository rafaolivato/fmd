// src/modules/estoque/controllers/GetLotesPorEstabelecimentoController.ts
import { Request, Response } from 'express';
import { prisma } from '../../../database/prismaClient';

export class GetLotesPorEstabelecimentoController {
  async handle(request: Request, response: Response) {
    try {
      const { estabelecimentoId } = request.query;

      if (!estabelecimentoId) {
        return response.status(400).json({
          error: 'estabelecimentoId é obrigatório'
        });
      }

      // Buscar todos os lotes do estabelecimento
      const lotes = await (prisma as any).estoque.findMany({
        where: {
          estabelecimentoId: estabelecimentoId as string,
          quantidade: {
            gt: 0 // Apenas lotes com quantidade disponível
          }
        },
        include: {
          lote: {
            select: {
              id: true,
              numeroLote: true,
              dataValidade: true,
              fabricante: true
            }
          },
          medicamento: {
            select: {
              id: true,
              principioAtivo: true,
              concentracao: true,
              unidadeMedida: true,
              psicotropico: true
            }
          }
        },
        orderBy: [
          {
            medicamento: {
              principioAtivo: 'asc'
            }
          },
          {
            lote: {
              dataValidade: 'asc'
            }
          }
        ]
      });

      // Formatar a resposta
      const lotesFormatados = lotes.map(item => ({
        id: item.lote.id,
        numeroLote: item.lote.numeroLote,
        dataValidade: item.lote.dataValidade,
        quantidade: item.quantidade,
        medicamentoId: item.medicamentoId,
        estabelecimentoId: item.estabelecimentoId,
        medicamento: item.medicamento,
        fabricante: item.lote.fabricante
      }));

      return response.json(lotesFormatados);

    } catch (error) {
      console.error('Erro ao buscar lotes do estabelecimento:', error);
      return response.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }
}