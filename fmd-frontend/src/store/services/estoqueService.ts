import { api } from './api';

export interface EstoqueLocal {
  id: string;
  medicamentoId: string;
  estabelecimentoId: string;
  quantidade: number;
  medicamento: {
    principioAtivo: string;
    concentracao: string;
    formaFarmaceutica: string;
  };
}

export const estoqueService = {
  async getEstoqueMedicamento(medicamentoId: string, estabelecimentoId: string): Promise<number> {
    try {
      const response = await api.get(`/estoque/${medicamentoId}/${estabelecimentoId}`);
      return response.data.quantidade;
    } catch (error) {
      console.error('Erro ao buscar estoque:', error);
      return 0;
    }
  }
};