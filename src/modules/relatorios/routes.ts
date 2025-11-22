import { Router } from 'express';
import { ListLotesEmEstoqueController } from './controllers/ListLotesEmEstoqueController';
import { ListLotesProximosVencimentoController } from './controllers/ListLotesProximosVencimentoController';
import { ListEstoqueLocalController } from './controllers/ListEstoqueLocalController'; 
import { ensureAuthenticated } from '../../middlewares/ensureAuthenticated';
import { RelatoriosController } from './controllers/RelatoriosController';

const relatoriosRoutes = Router();
const listLotesEmEstoqueController = new ListLotesEmEstoqueController();
const listLotesProximosVencimentoController = new ListLotesProximosVencimentoController();
const listEstoqueLocalController = new ListEstoqueLocalController();
const relatoriosController = new RelatoriosController();

relatoriosRoutes.use(ensureAuthenticated);

relatoriosRoutes.get('/lotes', (request, response, next) => {
    listLotesEmEstoqueController.handle(request, response, next);
});

relatoriosRoutes.get('/vencimento', (request, response, next) => {
    listLotesProximosVencimentoController.handle(request, response, next);
});

relatoriosRoutes.get('/estoque-local/:estabelecimentoId', (request, response, next) => {
    listEstoqueLocalController.handle(request, response, next);
});

relatoriosRoutes.get('/posicao-estoque', relatoriosController.getPosicaoEstoque);

relatoriosRoutes.get('/estabelecimentos', relatoriosController.getEstabelecimentos);

relatoriosRoutes.get('/dispensacoes', relatoriosController.getDispensacoes);

export { relatoriosRoutes };