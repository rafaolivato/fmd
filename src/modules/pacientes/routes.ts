import { Router } from 'express';
import { CreatePacienteController } from './controllers/CreatePacienteController';
import { ListPacientesController } from './controllers/ListPacientesController';
import { ensureAuthenticated } from '../../middlewares/ensureAuthenticated';
import { UpdatePacienteController } from './controllers/UpdatePacienteController';
import { DeletePacienteController } from './controllers/DeletePacienteController';

const pacientesRoutes = Router();

const createPacienteController = new CreatePacienteController();
const listPacientesController = new ListPacientesController();
const updatePacienteController = new UpdatePacienteController();
const deletePacienteController = new DeletePacienteController();

pacientesRoutes.use(ensureAuthenticated);

pacientesRoutes.post('/', createPacienteController.handle);
pacientesRoutes.get('/', listPacientesController.handle);
pacientesRoutes.put('/:id', updatePacienteController.handle);
pacientesRoutes.delete('/:id', deletePacienteController.handle);

export { pacientesRoutes };