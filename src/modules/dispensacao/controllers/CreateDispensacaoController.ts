import { Request, Response, NextFunction } from 'express';
import { CreateDispensacaoService } from '../services/CreateDispensacaoService';

class CreateDispensacaoController {
  async handle(request: Request, response: Response, next: NextFunction) {
    try {
      const createDispensacaoService = new CreateDispensacaoService();

      // ✅ Passa o body diretamente (desde que a DTO esteja correta)
      const dispensacao = await createDispensacaoService.execute(request.body);
      console.log('📋 Dados recebidos na dispensação:', {
        pacienteNome: request.body.pacienteNome,
        totalItens: request.body.itens.length,
        itens: request.body.itens.map(item => ({
          medicamentoId: item.medicamentoId,
          quantidade: item.quantidadeSaida,
          lotesSelecionados: item.lotes?.length || 0,
          lotes: item.lotes // ← Mostra os lotes específicos
        }))
      });
      return response.status(201).json(dispensacao);
    } catch (error) {
      next(error);
    }
  }
}

export { CreateDispensacaoController };