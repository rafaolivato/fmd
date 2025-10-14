import { Request, Response, NextFunction } from 'express';
import { CreateMovimentoEntradaService } from '../services/CreateMovimentoEntradaService';

class CreateMovimentoEntradaController {
  async handle(request: Request, response: Response, next: NextFunction) {
    // Adicione estabelecimentoId à desestruturação
   const { 
      tipoMovimentacao,
      fonteFinanciamento,
      fornecedor,
      documentoTipo,
      numeroDocumento,
      dataDocumento,
      dataRecebimento,
      valorTotal,
      observacao, 
      itens, 
      estabelecimentoId 
    } = request.body; 

    try {
      const createMovimentoEntradaService = new CreateMovimentoEntradaService();

      const movimento = await createMovimentoEntradaService.execute({
        tipoMovimentacao,
        fonteFinanciamento,
        fornecedor,
        documentoTipo,
        numeroDocumento,
        dataDocumento,
        dataRecebimento,
        valorTotal,
        observacao,
        itens,
        estabelecimentoId, 
      });

      return response.status(201).json(movimento);
    } catch (error) {
      next(error);
    }
  }
}

export { CreateMovimentoEntradaController };