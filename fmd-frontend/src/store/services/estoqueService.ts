// store/services/estoqueService.ts
import { api } from './api';
import type { EstoqueLote } from '../../types/Estoque';

// Dados mock para desenvolvimento
const lotesMock: EstoqueLote[] = [
  {
    id: 'lote-1',
    numeroLote: 'LOTE001',
    dataValidade: '2024-12-31',
    quantidade: 100,
    medicamentoId: 'bf571a46-f83c-4cd9-a9c3-8266c2dd3dee',
    estabelecimentoId: '1e7ee6da-fe51-4d1e-a61a-84362d8c6941',
    medicamento: {
      id: 'bf571a46-f83c-4cd9-a9c3-8266c2dd3dee',
      principioAtivo: 'Paracetamol',
      concentracao: '500mg',
      unidadeMedida: 'comprimido',
      psicotropico: false
    }
  },
  {
    id: 'lote-2',
    numeroLote: 'LOTE002',
    dataValidade: '2024-06-30',
    quantidade: 50,
    medicamentoId: 'bf571a46-f83c-4cd9-a9c3-8266c2dd3dee', 
    estabelecimentoId: '1e7ee6da-fe51-4d1e-a61a-84362d8c6941',
    medicamento: {
      id: 'bf571a46-f83c-4cd9-a9c3-8266c2dd3dee',
      principioAtivo: 'Paracetamol',
      concentracao: '500mg',
      unidadeMedida: 'comprimido',
      psicotropico: false
    }
  },
  {
    id: 'lote-3',
    numeroLote: 'LOTE003',
    dataValidade: '2024-09-15',
    quantidade: 75,
    medicamentoId: 'bf571a46-f83c-4cd9-a9c3-8266c2dd3dee',
    estabelecimentoId: '1e7ee6da-fe51-4d1e-a61a-84362d8c6941',
    medicamento: {
      id: 'bf571a46-f83c-4cd9-a9c3-8266c2dd3dee',
      principioAtivo: 'Paracetamol',
      concentracao: '500mg',
      unidadeMedida: 'comprimido', 
      psicotropico: false
    }
  }
];

export const estoqueService = {
  async getLotesDisponiveis(medicamentoId: string, estabelecimentoId: string): Promise<EstoqueLote[]> {
    try {
      console.log('🚀 Buscando lotes reais...');
      
      // Tenta a rota real primeiro
      const response = await api.get('/estoque/lotes-disponiveis', {
        params: { medicamentoId, estabelecimentoId }
      });
      
      console.log('✅ Lotes carregados do backend');
      return response.data;
      
    } catch (error: any) {
      console.log('⚠️ Usando dados mock temporariamente');
      
      // Filtra os dados mock pelo medicamentoId
      return lotesMock.filter(lote => 
        lote.medicamentoId === medicamentoId && 
        lote.estabelecimentoId === estabelecimentoId
      );
    }
  },

  async getLotesPorEstabelecimento(estabelecimentoId: string): Promise<EstoqueLote[]> {
    try {
      const response = await api.get('/estoque/lotes', {
        params: { estabelecimentoId }
      });
      return response.data;
    } catch (error) {
      console.log('⚠️ Usando dados mock para estabelecimento');
      return lotesMock.filter(lote => lote.estabelecimentoId === estabelecimentoId);
    }
  }
};