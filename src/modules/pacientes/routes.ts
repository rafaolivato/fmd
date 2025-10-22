// src/modules/pacientes/routes/pacientes.routes.ts
import { Router } from 'express';
import { CreatePacienteController } from './controllers/CreatePacienteController';
import { ListPacientesController } from './controllers/ListPacientesController';
import { ensureAuthenticated } from '../../middlewares/ensureAuthenticated';

const pacientesRoutes = Router();

const createPacienteController = new CreatePacienteController();
const listPacientesController = new ListPacientesController();

pacientesRoutes.use(ensureAuthenticated);

pacientesRoutes.post('/', createPacienteController.handle);
pacientesRoutes.get('/', listPacientesController.handle);

export { pacientesRoutes };