import { Router } from 'express';

const estoqueRoutes = Router();

// Rota simples de teste
estoqueRoutes.get('/lotes-disponiveis', (request, response) => {
  console.log('📦 Recebida requisição para lotes-disponiveis');
  
  const { medicamentoId, estabelecimentoId } = request.query;
  console.log('Parâmetros:', { medicamentoId, estabelecimentoId });

  // Retorna dados mock simples
  const lotesMock = [
    {
      id: 'teste-1',
      numeroLote: 'TEST001',
      dataValidade: '2024-12-31',
      quantidade: 100,
      medicamentoId,
      estabelecimentoId
    }
  ];

  return response.json(lotesMock);
});

export { estoqueRoutes };