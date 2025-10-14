// src/modules/requisicoes/routes.ts

import { Router } from 'express';
import { CreateRequisicaoController } from './controllers/CreateRequisicaoController';
import { AtenderRequisicaoController } from './controllers/AtenderRequisicaoController';
import { ensureAuthenticated } from '../../middlewares/ensureAuthenticated';

const requisicoesRoutes = Router();

const createRequisicaoController = new CreateRequisicaoController();
const atenderRequisicaoController = new AtenderRequisicaoController();

// Todas as rotas de requisições exigem autenticação
requisicoesRoutes.use(ensureAuthenticated);

// Rota para criar uma nova solicitação de medicamentos
requisicoesRoutes.post('/', (request, response, next) => {
  createRequisicaoController.handle(request, response, next);
});

// Rota para atender uma requisição (Transferência de Estoque)
requisicoesRoutes.patch('/:id/atender', (request, response, next) => { 
  atenderRequisicaoController.handle(request, response, next);
});

// Futuras rotas (GET /:id, GET /pendentes, etc.) viriam aqui

export { requisicoesRoutes };