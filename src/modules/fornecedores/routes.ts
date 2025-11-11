import { Router } from 'express';
import { CreateFornecedorController } from './controllers/CreateFornecedorController';
import { ListFornecedoresController } from './controllers/ListFornecedoresController';

const fornecedoresRoutes = Router();

const createFornecedorController = new CreateFornecedorController();
const listFornecedoresController = new ListFornecedoresController();

fornecedoresRoutes.post('/', createFornecedorController.handle);
fornecedoresRoutes.get('/', listFornecedoresController.handle);

export { fornecedoresRoutes };