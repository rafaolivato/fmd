// store/services/estoqueService.ts
import { api } from './api';
import type { EstoqueLote } from '../../types/Estoque';

// Adicione esta interface
export interface EstoqueResponse {
  quantidade: number;
  medicamento: {
    principioAtivo: string;
    concentracao: string;
    formaFarmaceutica: string;
  };
}

export const estoqueService = {
  // ✅ FUNÇÃO QUE A DISPENSAÇÃO PRECISA (RESTAURADA)
  async getEstoqueMedicamento(medicamentoId: string, estabelecimentoId: string): Promise<number> {
    try {
      console.log('🔍 Buscando estoque do medicamento:', {
        medicamentoId,
        estabelecimentoId
      });

      // PRIMEIRO: Tenta a rota original
      try {
        const response = await api.get<EstoqueResponse>(`/estoque/${medicamentoId}/${estabelecimentoId}`);
        return response.data.quantidade;
      } catch (error: any) {
        // Se a rota original não existir, tenta a nova rota
        if (error.response?.status === 404) {
         
          const response = await api.get('/estoque/quantidade', {
            params: { medicamentoId, estabelecimentoId }
          });
          return response.data.quantidade || 0;
        }
        throw error;
      }
    } catch (error) {
      console.error('❌ Erro ao buscar estoque:', error);
      return 0; // Retorna 0 em caso de erro
    }
  },

  // ✅ FUNÇÕES EXISTENTES (mantenha essas)
  async getLotesDisponiveis(medicamentoId: string, estabelecimentoId: string): Promise<EstoqueLote[]> {
    try {
     
      
      const response = await api.get('/estoque/lotes-disponiveis', {
        params: { medicamentoId, estabelecimentoId }
      });
      
      return response.data;
      
    } catch (error: any) {
      console.error('❌ Erro ao carregar lotes do backend:', error);
      throw new Error('Não foi possível carregar os lotes disponíveis');
    }
  },

  async getLotesPorEstabelecimento(estabelecimentoId: string): Promise<EstoqueLote[]> {
    try {
      const response = await api.get('/estoque/lotes', {
        params: { estabelecimentoId }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};