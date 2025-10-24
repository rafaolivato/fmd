import { Router, Request, Response, NextFunction } from 'express';
import { ensureAuthenticated } from '../../middlewares/ensureAuthenticated';
import { CreateUserController } from './controllers/CreateUserController';
import { prisma } from './../../database/prismaClient'; 

const userRoutes = Router();
const createUserController = new CreateUserController();

// Rota de Cadastro
userRoutes.post('/', (request, response, next) => {
    createUserController.handle(request, response, next);
});

// Rota para obter dados do usuário logado (NOVA ROTA)
userRoutes.get('/me', 
    ensureAuthenticated, 
    async (request: Request, response: Response, next: NextFunction) => { 
        try {
            type AuthenticatedRequest = Request & { user: { id: string } };
            const authRequest = request as AuthenticatedRequest;
            
            // Busca o usuário com estabelecimento
            const usuario = await prisma.user.findUnique({
                where: { id: authRequest.user.id },
                include: {
                    estabelecimento: {
                        select: {
                            id: true,
                            nome: true,
                            tipo: true
                        }
                    }
                }
            });

            if (!usuario) {
                return response.status(404).json({ message: 'Usuário não encontrado' });
            }

            // Remove a senha da resposta
            const { password, ...usuarioSemSenha } = usuario;

            return response.json(usuarioSemSenha);
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            return response.status(500).json({ message: 'Erro interno do servidor' });
        }
    }
);

// Rota Protegida (Perfil do Usuário) - Mantém a original
userRoutes.get('/profile', 
    ensureAuthenticated, 
    (request: Request, response: Response, next: NextFunction) => { 
        type AuthenticatedRequest = Request & { user: { id: string } };
        const authRequest = request as AuthenticatedRequest;
        
        return response.json({ 
            message: `Bem-vindo! Você está autenticado. Seu ID de Usuário é: ${authRequest.user.id}` 
        });
    }
); 

export { userRoutes };