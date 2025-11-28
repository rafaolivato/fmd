import express from 'express';
import { Express } from 'express';
import cors from 'cors';
import { routes } from './routes';
import { errorHandler } from './middlewares/errorHandler';

const app: Express = express(); 

app.use(cors());         // CORS

app.use(express.json()); // Body parser

app.use(routes);         // Rotas

app.use(errorHandler);

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));