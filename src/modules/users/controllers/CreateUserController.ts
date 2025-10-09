// modules/users/controllers/CreateUserController.ts

import { Request, Response, NextFunction } from 'express';
import { CreateUserService } from '../services/CreateUserService';

class CreateUserController {
  // Use NextFunction para repassar erros, assim como fizemos no AuthController
  async handle(request: Request, response: Response, next: NextFunction): Promise<Response | void> {
    const { name, email, password, role } = request.body;

    try {
      const createUserService = new CreateUserService();

      // Chama o Service para executar a lógica
      const user = await createUserService.execute({ name, email, password, role });

      // Retorno 201 Created com os dados do usuário (sem a senha)
      return response.status(201).json(user);
    } catch (error) {
      next(error); // Repassa o erro (AppError ou padrão) para o middleware
    }
  }
}

export { CreateUserController };