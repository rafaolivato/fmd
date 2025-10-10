import { Router } from 'express';
import { CreateEstabelecimentoController } from './controllers/CreateEstabelecimentoController';
import { ensureAuthenticated } from '../../middlewares/ensureAuthenticated';

const estabelecimentosRoutes = Router();
const createEstabelecimentoController = new CreateEstabelecimentoController();

estabelecimentosRoutes.use(ensureAuthenticated);

// Rota para criar um novo estabelecimento
estabelecimentosRoutes.post('/', (request, response, next) => {
  createEstabelecimentoController.handle(request, response, next);
});

export { estabelecimentosRoutes };