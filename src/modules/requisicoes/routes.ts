import { Router } from 'express';
import { CreateRequisicaoController } from './controllers/CreateRequisicaoController';
import { AtenderRequisicaoController } from './controllers/AtenderRequisicaoController';
import { ensureAuthenticated } from '../../middlewares/ensureAuthenticated';

import { ListAllRequisicoesController } from './controllers/ListAllRequisicoesController';
import { ListMinhasRequisicoesController } from './controllers/ListMinhasRequisicoesController';
import { ListParaAtenderRequisicoesController } from './controllers/ListParaAtenderRequisicoesController';
import { CancelarRequisicaoController } from './controllers/CancelarRequisicaoController';

const requisicoesRoutes = Router();

const createRequisicaoController = new CreateRequisicaoController();
const atenderRequisicaoController = new AtenderRequisicaoController();
const listAllRequisicoesController = new ListAllRequisicoesController();
const listMinhasRequisicoesController = new ListMinhasRequisicoesController();
const listParaAtenderRequisicoesController = new ListParaAtenderRequisicoesController();
const cancelarRequisicaoController = new CancelarRequisicaoController();

// Todas as rotas de requisições exigem autenticação
requisicoesRoutes.use(ensureAuthenticated);

// Rota para criar uma nova solicitação de medicamentos
requisicoesRoutes.post('/', (request, response) => {
  return createRequisicaoController.handle(request, response);
});

// Rota para listar todas as requisições
requisicoesRoutes.get('/', (request, response) => {
  return listAllRequisicoesController.handle(request, response);
});

// Rota para listar minhas requisições (onde sou solicitante)
requisicoesRoutes.get('/minhas', (request, response) => {
  return listMinhasRequisicoesController.handle(request, response);
});

// Rota para listar requisições para atender (onde sou atendente)
requisicoesRoutes.get('/para-atender', (request, response) => {
  return listParaAtenderRequisicoesController.handle(request, response);
});

// Rota para atender uma requisição (Transferência de Estoque)
requisicoesRoutes.put('/:id/atender', (request, response) => { 
  return atenderRequisicaoController.handle(request, response);
});

// Rota para cancelar uma requisição
requisicoesRoutes.put('/:id/cancelar', (request, response) => {
  return cancelarRequisicaoController.handle(request, response);
});

export { requisicoesRoutes };