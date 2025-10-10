// src/modules/medicamentos/routes.ts - ATUALIZADO

import { Router } from 'express';
import { CreateMedicamentoController } from './controllers/CreateMedicamentoController';
import { ListMedicamentosController } from './controllers/ListMedicamentosController'; // <-- NOVO IMPORT
import { ensureAuthenticated } from '../../middlewares/ensureAuthenticated';

const medicamentosRoutes = Router();
const createMedicamentoController = new CreateMedicamentoController();
const listMedicamentosController = new ListMedicamentosController(); // <-- NOVA INSTÂNCIA

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

export { medicamentosRoutes };