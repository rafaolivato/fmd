import { Router } from 'express';
import { GetEstoqueMedicamentoController } from './controllers/GetEstoqueMedicamentoController';
import { ensureAuthenticated } from '../../middlewares/ensureAuthenticated';

const estoqueRoutes = Router();
const getEstoqueMedicamentoController = new GetEstoqueMedicamentoController();

estoqueRoutes.use(ensureAuthenticated);

estoqueRoutes.get('/:medicamentoId/:estabelecimentoId', getEstoqueMedicamentoController.handle);

export { estoqueRoutes };