// src/modules/estoque/routes/estoqueRoutes.ts
import { Router } from 'express';
import { GetLotesDisponiveisController } from './controllers/GetLotesDisponiveisController';
import { prisma } from '../../database/prismaClient';

const estoqueRoutes = Router();
const getLotesDisponiveisController = new GetLotesDisponiveisController();

// Rota para lotes disponíveis (já existe)
estoqueRoutes.get('/lotes-disponiveis', (request, response) => {
  return getLotesDisponiveisController.handle(request, response);
});

// ✅ NOVA ROTA: Para a dispensação buscar estoque
estoqueRoutes.get('/:medicamentoId/:estabelecimentoId', async (request, response) => {
  try {
    const { medicamentoId, estabelecimentoId } = request.params;

    console.log('📊 Buscando estoque para dispensação:', { medicamentoId, estabelecimentoId });

    // 1. Tenta buscar do EstoqueLocal
    const estoqueLocal = await prisma.estoqueLocal.findUnique({
      where: {
        medicamentoId_estabelecimentoId: {
          medicamentoId,
          estabelecimentoId
        }
      },
      include: {
        medicamento: {
          select: {
            principioAtivo: true,
            concentracao: true,
            formaFarmaceutica: true
          }
        }
      }
    });

    if (estoqueLocal) {
      console.log('✅ Estoque local encontrado:', estoqueLocal.quantidade);
      return response.json({
        quantidade: estoqueLocal.quantidade,
        medicamento: estoqueLocal.medicamento
      });
    }

    // 2. Se não encontrou, calcula dos lotes
    const lotes = await prisma.estoqueLote.findMany({
      where: {
        medicamentoId,
        estabelecimentoId,
        quantidade: { gt: 0 }
      }
    });

    const total = lotes.reduce((sum, lote) => sum + lote.quantidade, 0);
    
    // Busca info do medicamento
    const medicamento = await prisma.medicamento.findUnique({
      where: { id: medicamentoId },
      select: {
        principioAtivo: true,
        concentracao: true,
        formaFarmaceutica: true
      }
    });

    console.log('📊 Estoque calculado dos lotes:', total);

    return response.json({
      quantidade: total,
      medicamento: medicamento || {
        principioAtivo: 'Medicamento não encontrado',
        concentracao: '',
        formaFarmaceutica: ''
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar estoque:', error);
    return response.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota alternativa (se quiser manter também)
estoqueRoutes.get('/quantidade', async (request, response) => {
  try {
    const { medicamentoId, estabelecimentoId } = request.query;
    
    console.log('🔍 Buscando quantidade no estoque:', { medicamentoId, estabelecimentoId });

    // Mesma lógica da rota acima...
    const estoqueLocal = await prisma.estoqueLocal.findUnique({
      where: {
        medicamentoId_estabelecimentoId: {
          medicamentoId: medicamentoId as string,
          estabelecimentoId: estabelecimentoId as string
        }
      }
    });

    if (estoqueLocal) {
      return response.json({ quantidade: estoqueLocal.quantidade });
    }

    const lotes = await prisma.estoqueLote.findMany({
      where: {
        medicamentoId: medicamentoId as string,
        estabelecimentoId: estabelecimentoId as string,
        quantidade: { gt: 0 }
      }
    });

    const total = lotes.reduce((sum, lote) => sum + lote.quantidade, 0);
    return response.json({ quantidade: total });

  } catch (error) {
    console.error('❌ Erro ao buscar quantidade:', error);
    return response.status(500).json({ error: 'Erro interno' });
  }
});

export { estoqueRoutes };