import express from 'express';
import { Express } from 'express';
import cors from 'cors';
import { routes } from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { estoqueRoutes } from './modules/estoque/routes';
import { pacientesRoutes } from './modules/pacientes/routes';
import { dispensacaoRoutes } from './modules/dispensacao/routes';
import { userRoutes } from './modules/users/routes';
import { movimentosRoutes } from './modules/movimentos/routes';
import { profissionaisSaudeRoutes } from './modules/profissionaisSaude/routes';


const app: Express = express(); 

app.use(cors());         // CORS

app.use(express.json()); // Body parser

app.use(routes);         // Rotas

app.use(errorHandler);

app.use('/estoque', estoqueRoutes);

app.use('/pacientes', pacientesRoutes);

app.use('/dispensacoes', dispensacaoRoutes);

app.use('/usuarios', userRoutes);

app.use('/movimentos', movimentosRoutes);

app.use('/profissionais-saude', profissionaisSaudeRoutes);


const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));