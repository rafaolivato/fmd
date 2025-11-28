import { Router } from 'express';
import { ListLotesEmEstoqueController } from './controllers/ListLotesEmEstoqueController';
import { ListLotesProximosVencimentoController } from './controllers/ListLotesProximosVencimentoController';
import { ListEstoqueLocalController } from './controllers/ListEstoqueLocalController'; 
import { ensureAuthenticated } from '../../middlewares/ensureAuthenticated';
import { RelatoriosController } from './controllers/RelatoriosController';
import { LivrosControladosController } from './controllers/LivrosControladosController'; 

const relatoriosRoutes = Router();
const listLotesEmEstoqueController = new ListLotesEmEstoqueController();
const listLotesProximosVencimentoController = new ListLotesProximosVencimentoController();
const listEstoqueLocalController = new ListEstoqueLocalController();
const relatoriosController = new RelatoriosController();
const livrosControladosController = new LivrosControladosController();


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

relatoriosRoutes.get('/livros-controlados', (req, res) => {
    livrosControladosController.getLivroPorCategoria(req, res);
});

relatoriosRoutes.get('/verificar-dados', (req, res) => {
    livrosControladosController.verificarDados(req, res);
});

export { relatoriosRoutes };