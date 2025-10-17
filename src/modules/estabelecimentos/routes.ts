import { Router } from 'express';
import { CreateEstabelecimentoController } from './controllers/CreateEstabelecimentoController';
import { ListEstabelecimentosController } from './controllers/ListEstabelecimentosController';
import { EstabelecimentoController } from './controllers/EstabelecimentoController';
import { ensureAuthenticated } from '../../middlewares/ensureAuthenticated';

const estabelecimentosRoutes = Router();
const createEstabelecimentoController = new CreateEstabelecimentoController();
const listEstabelecimentosController = new ListEstabelecimentosController();
const estabelecimentoController = new EstabelecimentoController();

estabelecimentosRoutes.use(ensureAuthenticated);

// Rota para criar um novo estabelecimento
estabelecimentosRoutes.post('/', (request, response, next) => {
  createEstabelecimentoController.handle(request, response, next);
});

estabelecimentosRoutes.get('/', (request, response, next) => {
  listEstabelecimentosController.handle(request, response, next);
});

export { estabelecimentosRoutes };