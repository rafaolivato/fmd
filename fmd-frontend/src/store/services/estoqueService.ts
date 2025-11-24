// store/services/estoqueService.ts
import { api } from './api';
import type { EstoqueLote } from '../../types/Estoque';

// store/services/estoqueService.ts
export const estoqueService = {
  async getLotesDisponiveis(medicamentoId: string, estabelecimentoId: string): Promise<EstoqueLote[]> {
    try {
      console.log('🚀 Buscando lotes reais do backend...');
      
      const response = await api.get('/estoque/lotes-disponiveis', {
        params: { medicamentoId, estabelecimentoId }
      });
      
      console.log(`✅ ${response.data.length} lotes carregados do backend`);
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
      console.error('❌ Erro ao buscar lotes do estabelecimento:', error);
      throw error;
    }
  }

};