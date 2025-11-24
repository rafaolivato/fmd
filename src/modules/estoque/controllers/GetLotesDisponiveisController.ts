import { Request, Response } from 'express';
import { prisma } from '../../../database/prismaClient';
import { AppError } from '../../../shared/errors/AppError';

export class GetLotesDisponiveisController {
  async handle(request: Request, response: Response) {
    console.log('📍 GetLotesDisponiveisController - INICIANDO');
    try {
      const { medicamentoId, estabelecimentoId } = request.query;

      console.log('📋 Parâmetros recebidos:', { medicamentoId, estabelecimentoId })

      if (!medicamentoId || !estabelecimentoId) {
        return response.status(400).json({
          error: 'medicamentoId e estabelecimentoId são obrigatórios'
        });
      }

      console.log('🔍 Buscando lotes reais no banco...', { medicamentoId, estabelecimentoId });

      // Buscar lotes disponíveis no estoque - VERIFIQUE SE SUA ESTRUTURA DO BANCO É ESTA
      const lotes = await prisma.estoqueLote.findMany({
        where: {
          medicamentoId: medicamentoId as string,
          estabelecimentoId: estabelecimentoId as string,
          quantidade: {
            gt: 0 // Apenas lotes com quantidade disponível
          }
        },
        include: {
          
          medicamento: true // Inclui os dados do medicamento
        },
        orderBy: {
         
            dataValidade: 'asc' // Ordenar por validade (FIFO)
          
        }
      });

      console.log(`✅ Encontrados ${lotes.length} lotes no banco`);

      const lotesFormatados = lotes.map(lote => ({
        id: lote.id,
        numeroLote: lote.numeroLote,
        dataValidade: lote.dataValidade,
        quantidade: lote.quantidade,
        medicamentoId: lote.medicamentoId,
        estabelecimentoId: lote.estabelecimentoId,
        medicamento: lote.medicamento
      }));

      return response.json(lotesFormatados);

    } catch (error) {
      console.error('❌ Erro ao buscar lotes disponíveis:', error);
      
      if (error instanceof AppError) {
        return response.status(error.statusCode).json({
          message: error.message
        });
      }

      return response.status(500).json({
        message: 'Erro interno do servidor'
      });
    }
  }
}