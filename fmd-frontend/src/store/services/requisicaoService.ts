import { api } from './api';
import type { Requisicao, RequisicaoFormData, ItemRequisicaoAtendimento } from '../../types/Requisicao';

export interface ItemRequisicaoAtendimentoComLotes {
  itemId: string;
  quantidadeAtendida: number;
  lotes?: {
    loteId: string;
    quantidade: number;
    numeroLote: string;
  }[];
}

export interface LoteAtendimento {
  loteId: string;
  quantidade: number;
  numeroLote: string;
}

export const requisicaoService = {
  async create(data: RequisicaoFormData): Promise<Requisicao> {
    const response = await api.post('/requisicoes', data);
    return response.data;
  },

  async getAll(): Promise<Requisicao[]> {
    const response = await api.get('/requisicoes');
    return response.data;
  },

  async getById(id: string): Promise<Requisicao> {
    const response = await api.get(`/requisicoes/${id}`);
    return response.data;
  },

  async atenderRequisicao(
    id: string,
    itensAtendidos: ItemRequisicaoAtendimentoComLotes[]
  ): Promise<Requisicao> {
    const response = await api.put(`/requisicoes/${id}/atender`, {
      itensAtendidos
    });
    return response.data;
  },

  async cancelarRequisicao(id: string): Promise<Requisicao> {
    const response = await api.put(`/requisicoes/${id}/cancelar`);
    return response.data;
  },

  async getMinhasRequisicoes(): Promise<Requisicao[]> {
    const response = await api.get('/requisicoes/minhas');
    return response.data;
  },


  async getParaAtender(): Promise<Requisicao[]> {
    const response = await api.get('/requisicoes/para-atender');
    return response.data;
  }
};