import { Router } from 'express';
import { authRoutes } from './modules/auth/routes';
import { userRoutes } from './modules/users/routes';
import { medicamentosRoutes } from './modules/medicamentos/routes'; 
import { movimentosRoutes } from './modules/movimentos/routes';

const routes = Router();

// Rota de Autenticação (Login)
routes.use('/auth', authRoutes);
// Rota de Cadastro de Usuário
routes.use('/users', userRoutes); 
routes.use('/medicamentos', medicamentosRoutes); // <-- NOVA ROTA
routes.use('/movimentos', movimentosRoutes);

export { routes };