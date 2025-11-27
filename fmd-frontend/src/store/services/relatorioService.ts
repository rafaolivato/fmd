import { api } from './api';

export interface ItemEstoqueRelatorio {
  id: string;
  medicamento: {
    principioAtivo: string;
    concentracao: string;
    formaFarmaceutica: string;
  };
  numeroLote: string;
  dataValidade: string;
  quantidade: number;
  valorUnitario: number;
  localizacao: string;
  estabelecimento: {
    nome: string;
  };
}

export interface DispensacaoRelatorio {
  id: string;
  dataDispensacao: string;
  medicamento: {
    principioAtivo: string;
    concentracao: string;
    formaFarmaceutica: string;
  };
  pacienteId: string;
  pacienteNome: string;
  pacienteCpf?: string;
  estabelecimentoNome: string;
  profissionalNome: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number; // ← NOVO CAMPO
  loteNumero?: string;
  documentoReferencia?: string;
}

export interface FiltroDispensacao {
  dataInicio: string;
  dataFim: string;
  estabelecimento?: string;
  paciente?: string;
}

export const relatorioService = {
  async getPosicaoEstoque(estabelecimento?: string): Promise<ItemEstoqueRelatorio[]> {
    try {
      console.log('📊 Buscando posição de estoque...');
      
      const params = estabelecimento ? { estabelecimento } : {};
      const response = await api.get('/relatorios/posicao-estoque', { params });
      
      console.log(`✅ ${response.data.length} itens reais encontrados`);
      return response.data;

    } catch (error) {
      console.error('❌ Erro ao buscar posição de estoque:', error);
      throw new Error('Não foi possível carregar a posição de estoque');
    }
  },

  async getEstabelecimentos(): Promise<string[]> {
    try {
      console.log('🏥 Buscando estabelecimentos...');
      const response = await api.get('/relatorios/estabelecimentos');
      console.log(`✅ ${response.data.length} estabelecimentos encontrados`);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar estabelecimentos:', error);
      throw new Error('Não foi possível carregar a lista de estabelecimentos');
    }
  },

  async getDispensacoes(filtros: FiltroDispensacao): Promise<DispensacaoRelatorio[]> {
    try {
      console.log('💊 Buscando dispensações com filtros:', filtros);
      
      const response = await api.get('/relatorios/dispensacoes', { params: filtros });
      
      console.log(`✅ ${response.data.length} dispensações encontradas`);
      return response.data;

    } catch (error) {
      console.error('❌ Erro ao buscar dispensações:', error);
      throw new Error('Não foi possível carregar as dispensações');
    }
  },
  
   async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  }
};