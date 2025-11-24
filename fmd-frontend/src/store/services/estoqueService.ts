import { api } from './api';

export interface EstoqueResponse {
  quantidade: number;
  medicamento: {
    principioAtivo: string;
    concentracao: string;
  };
}

export const estoqueService = {
  async getEstoqueMedicamento(medicamentoId: string, estabelecimentoId: string): Promise<number> {
    try {
      const response = await api.get<EstoqueResponse>(`/estoque/${medicamentoId}/${estabelecimentoId}`);
      return response.data.quantidade;
    } catch (error) {
      console.error('Erro ao buscar estoque:', error);
      return 0; // Retorna 0 em caso de erro (estoque vazio)
    }
  },
   async getLotesDisponiveis(medicamentoId: string, estabelecimentoId: string): Promise<EstoqueLote[]> {
    try {
      const response = await api.get(
        `/estoque/lotes-disponiveis?medicamentoId=${medicamentoId}&estabelecimentoId=${estabelecimentoId}`
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar lotes disponíveis:', error);
      throw error;
    }
  }
};
