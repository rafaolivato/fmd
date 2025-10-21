import { Request, Response, NextFunction } from 'express';
import { ListMedicamentosService } from '../services/ListMedicamentosService';

class ListMedicamentosController {
  async handle(request: Request, response: Response, next: NextFunction) {
    try {
      const listMedicamentosService = new ListMedicamentosService();

      const medicamentos = await listMedicamentosService.execute();

      return response.json(medicamentos);
    } catch (error) {
      next(error);
    }
  }
}

export { ListMedicamentosController };