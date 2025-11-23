import { Request, Response } from 'express';
import { LivrosControladosService } from '../services/LivrosControladosService';

const livrosService = new LivrosControladosService();

export class LivrosControladosController {

  async getLivroPorCategoria(request: Request, response: Response) {
    try {
      // Recebe os parâmetros da Query String
      const { tipoLista, dataInicio, dataFim } = request.query;

      if (!tipoLista || !dataInicio || !dataFim) {
        return response.status(400).json({ 
          error: 'Parâmetros obrigatórios: tipoLista, dataInicio, dataFim' 
        });
      }

      const relatorio = await livrosService.gerarLivro({
        tipoLista: String(tipoLista), // Ex: "B1"
        dataInicio: new Date(String(dataInicio)),
        dataFim: new Date(String(dataFim))
      });

      return response.json(relatorio);
      
    } catch (error: any) {
      console.error('Erro ao gerar livro:', error);
      return response.status(500).json({ error: 'Erro interno ao processar livro de controlados.' });
    }
  }
}