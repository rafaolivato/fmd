// src/modules/estoque/routes/estoqueRoutes.ts
import { Router } from 'express';
import { GetLotesDisponiveisController } from './controllers/GetLotesDisponiveisController';

const estoqueRoutes = Router();

const getLotesDisponiveisController = new GetLotesDisponiveisController();

// Rota para buscar lotes disponíveis
estoqueRoutes.get('/lotes-disponiveis', (request, response) => {
  return getLotesDisponiveisController.handle(request, response);
});

// Rota de teste
estoqueRoutes.get('/test', (request, response) => {
  console.log('✅ Rota de teste funcionando!');
  return response.json({ 
    message: 'Backend funcionando!', 
    timestamp: new Date().toISOString() 
  });
});

export { estoqueRoutes };