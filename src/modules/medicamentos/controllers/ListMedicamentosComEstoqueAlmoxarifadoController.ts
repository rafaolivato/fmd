
import { Request, Response } from 'express';
import { ListMedicamentosComEstoqueAlmoxarifadoService } from '../services/listMedicamentosComEstoqueAlmoxarifadoService';

export class ListMedicamentosComEstoqueAlmoxarifadoController {
  async handle(request: Request, response: Response): Promise<Response> {
    const listService = new ListMedicamentosComEstoqueAlmoxarifadoService();

    const medicamentos = await listService.execute();

    return response.json(medicamentos);
  }
}

