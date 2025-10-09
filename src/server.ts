
import express, { Express } from 'express'; 

import cors from 'cors';
import { routes } from './routes';
import { errorHandler } from './middlewares/errorHandler';

// NO ENTANTO, a linha mais importante é a inicialização:
// Se o erro persistir, mude a inicialização para:
const app = (express as any)(); // <--- SOLUÇÃO FORÇADA: Chama o Express como função, ignorando a tipagem temporariamente.

// ... Seu código que usa express.json()
app.use(express.json()); // Esta linha é herdada da importação correta

app.use(cors());
app.use(routes);

app.use(errorHandler);

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));