import { Router } from 'express';
import { CreateMedicamentoController } from './controllers/CreateMedicamentoController';
import { ListMedicamentosController } from './controllers/ListMedicamentosController'; 
import { UpdateMedicamentoController } from './controllers/UpdateMedicamentoController';
import { DeleteMedicamentoController } from './controllers/DeleteMedicamentoController';
import { GetAllMedicamentosController } from './controllers/GetAllMedicamentosController';
import { ensureAuthenticated } from '../../middlewares/ensureAuthenticated';
import { ListMedicamentosComEstoqueAlmoxarifadoController } from './controllers/ListMedicamentosComEstoqueAlmoxarifadoController';
import { ListMedicamentosComEstoqueController } from './controllers/ListMedicamentosComEstoqueController';
import { ListCategoriasController } from './controllers/ListCategoriasController';

const medicamentosRoutes = Router();

const createMedicamentoController = new CreateMedicamentoController();
const listMedicamentosController = new ListMedicamentosController(); 
const updateMedicamentoController = new UpdateMedicamentoController();
const deleteMedicamentoController = new DeleteMedicamentoController();
const getAllMedicamentosController = new GetAllMedicamentosController();
const listMedsComEstoqueController = new ListMedicamentosComEstoqueAlmoxarifadoController();
const listMedicamentosComEstoqueController = new ListMedicamentosComEstoqueController();
const listCategoriasController = new ListCategoriasController();

// Rota para categorias - DEVE VIR ANTES DE ROTAS COM PARÂMETROS
medicamentosRoutes.get('/categorias', listCategoriasController.handle);

// Todas as rotas de medicamentos precisam de autenticação
medicamentosRoutes.use(ensureAuthenticated);

// CORRIJA A ORDEM E EVITE DUPLICAÇÃO DE ROTAS GET '/'

// Rota para cadastrar um novo medicamento (POST)
medicamentosRoutes.post('/', createMedicamentoController.handle);

// Rota para listar todos os medicamentos (GET) - APENAS UMA ROTA GET '/'
medicamentosRoutes.get('/', getAllMedicamentosController.handle);



// Outras rotas
medicamentosRoutes.put('/:id', updateMedicamentoController.handle);
medicamentosRoutes.delete('/:id', deleteMedicamentoController.handle);
medicamentosRoutes.get('/com-estoque-almoxarifado', listMedsComEstoqueController.handle);
medicamentosRoutes.get('/com-estoque', listMedicamentosComEstoqueController.handle);

export { medicamentosRoutes };