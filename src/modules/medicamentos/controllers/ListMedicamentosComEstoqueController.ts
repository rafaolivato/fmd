import { Request, Response } from 'express';
import { ListMedicamentosComEstoqueService } from '../services/ListMedicamentosComEstoqueService';

class ListMedicamentosComEstoqueController {
  async handle(request: Request, response: Response) {
    try {
      const { estabelecimentoId } = request.query;

      if (!estabelecimentoId) {
        return response.status(400).json({ 
          error: 'Estabelecimento ID é obrigatório' 
        });
      }

      const listMedicamentosComEstoqueService = new ListMedicamentosComEstoqueService();
      
      const medicamentos = await listMedicamentosComEstoqueService.execute({
        estabelecimentoId: estabelecimentoId as string
      });

      return response.json(medicamentos);

    } catch (error: any) {
      console.error('Erro ao buscar medicamentos com estoque:', error);
      return response.status(500).json({ 
        error: error.message || 'Erro interno do servidor' 
      });
    }
  }
}

export { ListMedicamentosComEstoqueController };