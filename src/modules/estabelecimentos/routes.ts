import { Router } from 'express';
import { CreateEstabelecimentoController } from './controllers/CreateEstabelecimentoController';
import { ListEstabelecimentosController } from './controllers/ListEstabelecimentosController';
import { EstabelecimentoController } from './controllers/EstabelecimentoController';
import { ensureAuthenticated } from '../../middlewares/ensureAuthenticated';
import { DeleteEstabelecimentoController } from './controllers/DeleteEstabelecimentoController'; 
import { UpdateEstabelecimentoController } from './controllers/UpdateEstabelecimentoController';

const estabelecimentosRoutes = Router();
const createEstabelecimentoController = new CreateEstabelecimentoController();
const listEstabelecimentosController = new ListEstabelecimentosController();
const estabelecimentoController = new EstabelecimentoController();
const deleteEstabelecimentoController = new DeleteEstabelecimentoController();
const updateEstabelecimentoController = new UpdateEstabelecimentoController();

estabelecimentosRoutes.use(ensureAuthenticated);

// Rota para criar um novo estabelecimento
estabelecimentosRoutes.post('/', (request, response, next) => {
  createEstabelecimentoController.handle(request, response, next);
});

estabelecimentosRoutes.get('/', (request, response, next) => {
  listEstabelecimentosController.handle(request, response, next);
});

estabelecimentosRoutes.delete('/:id', (request, response, next) => {
    deleteEstabelecimentoController.handle(request, response, next);
});

estabelecimentosRoutes.patch('/:id', (request, response, next) => {
    updateEstabelecimentoController.handle(request, response, next);
});

export { estabelecimentosRoutes };