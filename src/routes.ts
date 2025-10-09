import { Router } from 'express';
import { authRoutes } from './modules/auth/routes';
import { userRoutes } from './modules/users/routes'; // <-- Importe as rotas de usuário

const routes = Router();

// Rota de Autenticação (Login)
routes.use('/auth', authRoutes);

// Rota de Cadastro de Usuário
routes.use('/users', userRoutes); // <-- Adicione a rota de usuário

export { routes };