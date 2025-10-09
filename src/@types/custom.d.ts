import { Request } from 'express';

// Declara a interface estendida
declare global {
  namespace Express {
    // Define a interface para requisições que JÁ PASSARAM pelo ensureAuthenticated
    export interface Request { // <--- Estende a Request dentro do namespace
      user: {
        id: string;
      };
    }
  }
}