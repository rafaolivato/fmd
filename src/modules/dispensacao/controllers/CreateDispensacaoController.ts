import { Request, Response, NextFunction } from 'express';
import { CreateDispensacaoService } from '../services/CreateDispensacaoService';

class CreateDispensacaoController {
  async handle(request: Request, response: Response, next: NextFunction) {
    const data = request.body; 

    try {
      const createDispensacaoService = new CreateDispensacaoService();

      const dispensacao = await createDispensacaoService.execute(data);

      return response.status(201).json(dispensacao);
    } catch (error) {
      next(error);
    }
  }
}

export { CreateDispensacaoController };