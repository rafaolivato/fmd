// src/modules/users/routes.ts - CORRIGIDO

import { Router, Request, Response, NextFunction } from 'express';
import { ensureAuthenticated } from '../../middlewares/ensureAuthenticated';
import { CreateUserController } from './controllers/CreateUserController';

const userRoutes = Router();
const createUserController = new CreateUserController();

// Rota de Cadastro
userRoutes.post('/', (request, response, next) => {
    createUserController.handle(request, response, next);
});

// Rota Protegida (Perfil do Usuário)
userRoutes.get('/profile', 
    ensureAuthenticated, 
    (
        request: Request, // Recebe a Request padrão
        response: Response, 
        next: NextFunction 
    ) => { 
        // 1. Defina o tipo de requisição autenticada
        type AuthenticatedRequest = Request & { user: { id: string } };

        // 2. Converta a requisição para o tipo autenticado (Isso elimina o erro TS2339)
        const authRequest = request as AuthenticatedRequest;
        
        // 3. Use a nova requisição
        return response.json({ 
            message: `Bem-vindo! Você está autenticado. Seu ID de Usuário é: ${authRequest.user.id}` 
        });
    }
); 

export { userRoutes };