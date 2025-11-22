import { Router } from 'express';
import { ProfissionaisSaudeController } from './controllers/profissionaisSaudeController';

const profissionaisSaudeRoutes = Router();

const profissionaisSaudeController = new ProfissionaisSaudeController();

// Seguindo o mesmo padrão dos fornecedores
profissionaisSaudeRoutes.post('/', profissionaisSaudeController.handleCreate);
profissionaisSaudeRoutes.get('/', profissionaisSaudeController.handleList);
profissionaisSaudeRoutes.put('/:id', profissionaisSaudeController.handleUpdate);
profissionaisSaudeRoutes.delete('/:id', profissionaisSaudeController.handleDelete);

// Rota adicional para busca
profissionaisSaudeRoutes.get('/buscar', profissionaisSaudeController.handleSearch);

export { profissionaisSaudeRoutes };