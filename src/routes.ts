import { Router } from 'express';
import { authRoutes } from './modules/auth/routes';
import { userRoutes } from './modules/users/routes';
import { medicamentosRoutes } from './modules/medicamentos/routes'; 
import { movimentosRoutes } from './modules/movimentos/routes';
import { dispensacaoRoutes } from './modules/dispensacao/routes';
import { relatoriosRoutes } from './modules/relatorios/routes'; 

const routes = Router();

routes.use('/auth', authRoutes);
routes.use('/users', userRoutes); 
routes.use('/medicamentos', medicamentosRoutes);
routes.use('/movimentos', movimentosRoutes);
routes.use('/dispensacao', dispensacaoRoutes);
routes.use('/relatorios', relatoriosRoutes);

export { routes };