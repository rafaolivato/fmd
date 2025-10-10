// src/modules/movimentos/routes.ts

import { Router } from 'express';
import { CreateMovimentoEntradaController } from './controllers/CreateMovimentoEntradaController';
import { ensureAuthenticated } from '../../middlewares/ensureAuthenticated';

const movimentosRoutes = Router();
const createMovimentoEntradaController = new CreateMovimentoEntradaController();

// Todas as rotas de movimento precisam de autenticação
movimentosRoutes.use(ensureAuthenticated);

// Rota para registrar uma entrada de estoque
movimentosRoutes.post('/entrada', (request, response, next) => {
  createMovimentoEntradaController.handle(request, response, next);
});

export { movimentosRoutes };