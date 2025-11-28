import { Request, Response } from 'express';
import { LivrosControladosService } from '../services/LivrosControladosService';

const livrosService = new LivrosControladosService();

export class LivrosControladosController {

  async getLivroPorCategoria(request: Request, response: Response) {
    try {
      // Recebe os parâmetros da Query String
      const { tipoLista, dataInicio, dataFim, medicamentoId } = request.query;

      if (!tipoLista || !dataInicio || !dataFim) {
        return response.status(400).json({ 
          error: 'Parâmetros obrigatórios: tipoLista, dataInicio, dataFim' 
        });
      }

      const filtro: any = {
        tipoLista: String(tipoLista),
        dataInicio: new Date(String(dataInicio)),
        dataFim: new Date(String(dataFim))
      };

      // Se medicamentoId foi fornecido
      if (medicamentoId) {
        filtro.medicamentoId = String(medicamentoId);
      }

      const relatorio = await livrosService.gerarLivro(filtro);

      return response.json(relatorio);
      
    } catch (error: any) {
      console.error('Erro ao gerar livro:', error);
      return response.status(500).json({ 
        error: 'Erro interno ao processar livro de controlados.',
        details: error.message 
      });
    }
  }

   async verificarDados(request: Request, response: Response) {
    try {
      const { tipoLista } = request.query;

      if (!tipoLista) {
        return response.status(400).json({ 
          error: 'Parâmetro obrigatório: tipoLista' 
        });
      }

      const dados = await livrosService.verificarDadosExistentes(String(tipoLista));

      return response.json(dados);
      
    } catch (error: any) {
      console.error('Erro ao verificar dados:', error);
      return response.status(500).json({ 
        error: 'Erro ao verificar dados existentes.',
        details: error.message 
      });
    }
  }
}