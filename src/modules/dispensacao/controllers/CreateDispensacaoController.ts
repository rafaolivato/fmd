import { Request, Response, NextFunction } from 'express';
import { CreateDispensacaoService } from '../services/CreateDispensacaoService';

class CreateDispensacaoController {
  async handle(request: Request, response: Response, next: NextFunction) {
    try {
      const createDispensacaoService = new CreateDispensacaoService();

      // ✅ Passa o body diretamente (desde que a DTO esteja correta)
      const dispensacao = await createDispensacaoService.execute(request.body);

      return response.status(201).json(dispensacao);
    } catch (error) {
      next(error);
    }
  }
}

export { CreateDispensacaoController };