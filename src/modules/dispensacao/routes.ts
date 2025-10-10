import { Router } from 'express';
import { CreateDispensacaoController } from './controllers/CreateDispensacaoController';
import { ListDispensacoesController } from './controllers/ListDispensacoesController'; 
import { ensureAuthenticated } from '../../middlewares/ensureAuthenticated';



const dispensacaoRoutes = Router();
const createDispensacaoController = new CreateDispensacaoController();
const listDispensacoesController = new ListDispensacoesController();

// Todas as rotas de dispensação precisam de autenticação
dispensacaoRoutes.use(ensureAuthenticated);

// Rota para registrar uma saída de estoque (Dispensação)
dispensacaoRoutes.post('/', (request, response, next) => {
  createDispensacaoController.handle(request, response, next);
});
// Rota para listar todos os documentos de dispensação (GET)
dispensacaoRoutes.get('/', (request, response, next) => {
    listDispensacoesController.handle(request, response, next);
});

export { dispensacaoRoutes };