import { Router } from 'express';
import { AuthController } from './controllers/AuthController';

const authRoutes = Router();
const authController = new AuthController();

authRoutes.post('/login', (request, response, next) => {
    authController.handle(request, response, next);
});

export { authRoutes };