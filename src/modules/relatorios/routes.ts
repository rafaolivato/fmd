import { Router } from 'express';
import { ListLotesEmEstoqueController } from './controllers/ListLotesEmEstoqueController';
import { ListLotesProximosVencimentoController } from './controllers/ListLotesProximosVencimentoController'; // <-- NOVO IMPORT
import { ensureAuthenticated } from '../../middlewares/ensureAuthenticated';

const relatoriosRoutes = Router();
const listLotesEmEstoqueController = new ListLotesEmEstoqueController();
const listLotesProximosVencimentoController = new ListLotesProximosVencimentoController(); // <-- NOVA INSTÂNCIA

// Todas as rotas de relatórios precisam de autenticação
relatoriosRoutes.use(ensureAuthenticated);

// Rota para listar o estoque detalhado por lote/validade
relatoriosRoutes.get('/lotes', (request, response, next) => {
    listLotesEmEstoqueController.handle(request, response, next);
});

// Rota para listar lotes que vencem nos próximos 90 dias
relatoriosRoutes.get('/vencimento', (request, response, next) => {
    listLotesProximosVencimentoController.handle(request, response, next);
});

export { relatoriosRoutes };