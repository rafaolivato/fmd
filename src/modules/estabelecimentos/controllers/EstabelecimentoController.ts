// fmd-backend/src/modules/estabelecimentos/controllers/EstabelecimentoController.ts
import { Request, Response, NextFunction } from 'express';
// Importe o seu serviço de criação existente
import { CreateEstabelecimentoService } from '../services/CreateEstabelecimentoService'; 
// Importe o novo serviço de listagem
import { FindAllEstabelecimentosService } from '../services/FindAllEstabelecimentosService'; 


class EstabelecimentoController {

  // Método para CRIAÇÃO (POST)
  async create(request: Request, response: Response, next: NextFunction) {
    // Este código é o mesmo que você já tem no seu CreateEstabelecimentoController
    const { nome, cnpj, tipo } = request.body; 

    try {
      const createService = new CreateEstabelecimentoService();
      const estabelecimento = await createService.execute({ nome, cnpj, tipo });

      return response.status(201).json(estabelecimento);
    } catch (error) {
      next(error);
    }
  }

  // Método para LISTAGEM (GET)
  async index(request: Request, response: Response, next: NextFunction) {
    try {
      const findAllService = new FindAllEstabelecimentosService();
      const estabelecimentos = await findAllService.execute();
      
      // Retorna 200 OK com a lista
      return response.status(200).json(estabelecimentos);
    } catch (error) {
      next(error);
    }
  }
}

export { EstabelecimentoController };