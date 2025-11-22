import { Router } from 'express';
import { CreateMovimentoEntradaController } from './controllers/CreateMovimentoEntradaController';
import { ListMovimentosController } from './controllers/ListMovimentosController';
import { CreateMovimentoSaidaController} from './controllers/CreateMovimentoSaidaController';
import { ensureAuthenticated } from '../../middlewares/ensureAuthenticated';
import { GetMovimentoByIdController } from './controllers/GetMovimentoByIdController';
import { ListMedicamentosComEstoqueController } from '../medicamentos/controllers/ListMedicamentosComEstoqueController';
import { GetMedicamentosEstoqueController } from './controllers/GetMedicamentosEstoqueController';


const movimentosRoutes = Router();
const createMovimentoEntradaController = new CreateMovimentoEntradaController();
const createMovimentoSaidaController = new CreateMovimentoSaidaController();
const listMovimentosController = new ListMovimentosController(); 
const getMovimentoByIdController = new GetMovimentoByIdController();
const getMedicamentosEstoqueController = new GetMedicamentosEstoqueController(); 

// Todas as rotas de movimentos precisam de autenticação
movimentosRoutes.use(ensureAuthenticated);

// Rota para registrar uma entrada de estoque (POST)
movimentosRoutes.post('/entrada', (request, response, next) => {
  createMovimentoEntradaController.handle(request, response, next);
});

// Rota para listar todos os documentos de movimento (GET)
movimentosRoutes.get('/', (request, response, next) => {
    listMovimentosController.handle(request, response, next);
});

movimentosRoutes.get('/:id', getMovimentoByIdController.handle);

movimentosRoutes.post('/saida', (request, response, next) => {
  createMovimentoSaidaController.handle(request, response, next);
});

movimentosRoutes.get('/medicamentos/estoque', getMedicamentosEstoqueController.handle);



export { movimentosRoutes };