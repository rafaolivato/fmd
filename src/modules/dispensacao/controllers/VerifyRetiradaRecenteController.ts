import { Request, Response } from 'express';
import { VerifyRetiradaRecenteService } from '../services/VerifyRetiradaRecenteService';

class VerifyRetiradaRecenteController {
  private verifyRetiradaService: VerifyRetiradaRecenteService;

  constructor() {
    this.verifyRetiradaService = new VerifyRetiradaRecenteService();
  }

  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const { pacienteCpf, medicamentoId, estabelecimentoId } = request.body;

      const resultado = await this.verifyRetiradaService.execute({
        pacienteCpf,
        medicamentoId,
        estabelecimentoId
      });

      return response.json(resultado);
    } catch (error: any) {
      return response.status(400).json({
        error: error.message
      });
    }
  }
}

export { VerifyRetiradaRecenteController };