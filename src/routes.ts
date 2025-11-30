import { Router } from 'express';
import { authRoutes } from './modules/auth/routes';
import { userRoutes } from './modules/users/routes';
import { medicamentosRoutes } from './modules/medicamentos/routes'; 
import { movimentosRoutes } from './modules/movimentos/routes';
import { dispensacaoRoutes } from './modules/dispensacao/routes';
import { relatoriosRoutes } from './modules/relatorios/routes'; 
import { estabelecimentosRoutes } from './modules/estabelecimentos/routes'
import { requisicoesRoutes } from './modules/requisicoes/routes';
import { fornecedoresRoutes } from './modules/fornecedores/routes';
import { dashboardRoutes } from './modules/dashboard/routes';
import { estoqueRoutes } from './modules/estoque/routes';
import { pacientesRoutes } from './modules/pacientes/routes'; 
import { profissionaisSaudeRoutes } from './modules/profissionaisSaude/routes'; 


const routes = Router();

routes.use('/auth', authRoutes);
routes.use('/users', userRoutes); 
routes.use('/medicamentos', medicamentosRoutes);
routes.use('/movimentos', movimentosRoutes);
routes.use('/dispensacao', dispensacaoRoutes);
routes.use('/relatorios', relatoriosRoutes);
routes.use('/estabelecimentos', estabelecimentosRoutes);
routes.use('/requisicoes', requisicoesRoutes);
routes.use('/fornecedores', fornecedoresRoutes);
routes.use('/dashboard', dashboardRoutes);
routes.use('/estoque', estoqueRoutes);
routes.use('/pacientes', pacientesRoutes); 
routes.use('/profissionais-saude', profissionaisSaudeRoutes);
routes.use('/dispensacoes', dispensacaoRoutes);

export { routes };