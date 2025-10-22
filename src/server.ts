import express from 'express';
import { Express } from 'express';
import cors from 'cors';
import { routes } from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { estoqueRoutes } from './modules/estoque/routes';
import { pacientesRoutes } from './modules/pacientes/routes';
import { dispensacaoRoutes } from './modules/dispensacao/routes';


// A forma PADRÃO e correta de inicializar o Express
const app: Express = express(); 

app.use(cors());         // CORS

app.use(express.json()); // Body parser

app.use(routes);         // Rotas

app.use(errorHandler);

app.use('/estoque', estoqueRoutes);

app.use('/pacientes', pacientesRoutes);

app.use('/dispensacoes', dispensacaoRoutes);

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));