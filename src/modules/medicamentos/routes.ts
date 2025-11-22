import { Router } from 'express';
import { CreateMedicamentoController } from './controllers/CreateMedicamentoController';
import { ListMedicamentosController } from './controllers/ListMedicamentosController'; 
import { UpdateMedicamentoController } from './controllers/UpdateMedicamentoController';
import { DeleteMedicamentoController } from './controllers/DeleteMedicamentoController';
import { GetAllMedicamentosController } from './controllers/GetAllMedicamentosController';
import { ensureAuthenticated } from '../../middlewares/ensureAuthenticated';
import { ListMedicamentosComEstoqueAlmoxarifadoController } from './controllers/ListMedicamentosComEstoqueAlmoxarifadoController';
import { ListMedicamentosComEstoqueController } from './controllers/ListMedicamentosComEstoqueController';

const medicamentosRoutes = Router();
const createMedicamentoController = new CreateMedicamentoController();
const listMedicamentosController = new ListMedicamentosController(); 
const updateMedicamentoController = new UpdateMedicamentoController();
const deleteMedicamentoController = new DeleteMedicamentoController();
const getAllMedicamentosController = new GetAllMedicamentosController();
const listMedsComEstoqueController = new ListMedicamentosComEstoqueAlmoxarifadoController();
const listMedicamentosComEstoqueController = new ListMedicamentosComEstoqueController();

// Todas as rotas de medicamentos precisam de autenticação
medicamentosRoutes.use(ensureAuthenticated);

// Rota para cadastrar um novo medicamento (POST)
medicamentosRoutes.post('/', (request, response, next) => {
  createMedicamentoController.handle(request, response, next);
});

// Rota para listar todos os medicamentos (GET)
medicamentosRoutes.get('/', (request, response, next) => {
    listMedicamentosController.handle(request, response, next);
});

medicamentosRoutes.get('/', getAllMedicamentosController.handle);
medicamentosRoutes.put('/:id', updateMedicamentoController.handle);
medicamentosRoutes.delete('/:id', deleteMedicamentoController.handle);

medicamentosRoutes.get('/com-estoque-almoxarifado', listMedsComEstoqueController.handle);

medicamentosRoutes.get('/com-estoque', listMedicamentosComEstoqueController.handle);


export { medicamentosRoutes };