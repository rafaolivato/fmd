import { Router } from 'express';
import { CreateRequisicaoController } from './controllers/CreateRequisicaoController';
import { AtenderRequisicaoController } from './controllers/AtenderRequisicaoController';
import { ensureAuthenticated } from '../../middlewares/ensureAuthenticated';

// Importando os novos controllers que você precisará criar
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
requisicoesRoutes.post('/', (request, response, next) => {
  createRequisicaoController.handle(request, response, next);
});

// Rota para listar todas as requisições
requisicoesRoutes.get('/', (request, response, next) => {
  listAllRequisicoesController.handle(request, response, next);
});

// Rota para listar minhas requisições (onde sou solicitante)
requisicoesRoutes.get('/minhas', (request, response, next) => {
  listMinhasRequisicoesController.handle(request, response, next);
});

// Rota para listar requisições para atender (onde sou atendente)
requisicoesRoutes.get('/para-atender', (request, response, next) => {
  listParaAtenderRequisicoesController.handle(request, response, next);
});

// Rota para atender uma requisição (Transferência de Estoque)
requisicoesRoutes.put('/:id/atender', (request, response, next) => { 
  atenderRequisicaoController.handle(request, response, next);
});

// Rota para cancelar uma requisição
requisicoesRoutes.put('/:id/cancelar', (request, response, next) => {
  cancelarRequisicaoController.handle(request, response, next);
});

export { requisicoesRoutes };