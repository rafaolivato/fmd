import { Request, Response, NextFunction } from 'express';
import { CreateDispensacaoService } from '../services/CreateDispensacaoService';

class CreateDispensacaoController {
  async handle(request: Request, response: Response, next: NextFunction) {
    const { pacienteNome, pacienteCpf, profissionalSaude, documentoReferencia, observacao, itens, estabelecimentoOrigemId } = request.body;  

    try {
      const createDispensacaoService = new CreateDispensacaoService();

      const dispensacao = await createDispensacaoService.execute({
        pacienteNome,
        pacienteCpf,
        profissionalSaude,
        documentoReferencia,
        observacao,
        itens,
        
        // NOVO CAMPO PASSADO PARA O SERVICE
        estabelecimentoOrigemId,
      });

      return response.status(201).json(dispensacao);
    } catch (error) {
      next(error);
    }
  }
}

export { CreateDispensacaoController };