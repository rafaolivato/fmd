import { Request, Response, NextFunction } from 'express'; // Importe NextFunction
import { AuthService } from '../services/AuthService';
import { AppError } from '../../../shared/errors/AppError'; // Importe AppError

class AuthController {
  // Adicione next: NextFunction
  async handle(request: Request, response: Response, next: NextFunction): Promise<Response | void> {
    const { email, password } = request.body;
    
    try { // *** Adicionamos o try/catch ***
      const authService = new AuthService();
      const { user, token } = await authService.execute({ email, password });

      return response.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, token });
    } catch (error) {
      // Repassa o erro (seja AppError ou Error padrão) para o errorHandler.ts
      next(error); 
    }
  }
}

export { AuthController };