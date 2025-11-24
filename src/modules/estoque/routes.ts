import { Router } from 'express';
import { GetEstoqueMedicamentoController } from './controllers/GetEstoqueMedicamentoController';
import { ensureAuthenticated } from '../../middlewares/ensureAuthenticated';
import { GetLotesDisponiveisController } from './controllers/GetLotesDisponiveisController';

const estoqueRoutes = Router();

const getEstoqueMedicamentoController = new GetEstoqueMedicamentoController();

const getLotesDisponiveisController = new GetLotesDisponiveisController();

estoqueRoutes.use(ensureAuthenticated);

estoqueRoutes.get('/:medicamentoId/:estabelecimentoId', getEstoqueMedicamentoController.handle);

estoqueRoutes.get('/lotes/disponiveis', getLotesDisponiveisController.handle);

export { estoqueRoutes };