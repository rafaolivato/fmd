import { Router } from 'express';
import { CreateFornecedorController } from './controllers/CreateFornecedorController';
import { ListFornecedoresController } from './controllers/ListFornecedoresController';
import { UpdateFornecedorController } from './controllers/UpdateFornecedorController';
import { DeleteFornecedorController } from './controllers/DeleteFornecedorController';

const fornecedoresRoutes = Router();

const createFornecedorController = new CreateFornecedorController();
const listFornecedoresController = new ListFornecedoresController();
const updateFornecedorController = new UpdateFornecedorController();
const deleteFornecedorController = new DeleteFornecedorController();

fornecedoresRoutes.post('/', createFornecedorController.handle);
fornecedoresRoutes.get('/', listFornecedoresController.handle);
fornecedoresRoutes.put('/:id', updateFornecedorController.handle);
fornecedoresRoutes.delete('/:id', deleteFornecedorController.handle);

export { fornecedoresRoutes };