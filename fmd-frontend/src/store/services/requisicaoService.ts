// src/store/services/requisicaoService.ts
import { api } from './api';
import type { Requisicao, RequisicaoFormData, ItemRequisicaoAtendimento } from '../../types/Requisicao';

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

  async atenderRequisicao(id: string, itensAtendidos: ItemRequisicaoAtendimento[]): Promise<Requisicao> {
    const response = await api.put(`/requisicoes/${id}/atender`, { itensAtendidos });
    return response.data;
  },

  async cancelarRequisicao(id: string): Promise<Requisicao> {
    const response = await api.put(`/requisicoes/${id}/cancelar`);
    return response.data;
  },

  async getMinhasRequisicoes(estabelecimentoId: string): Promise<Requisicao[]> {
    const response = await api.get(`/requisicoes/minhas?estabelecimentoId=${estabelecimentoId}`);
    return response.data;
  },

  async getParaAtender(estabelecimentoId: string): Promise<Requisicao[]> {
    const response = await api.get(`/requisicoes/para-atender?estabelecimentoId=${estabelecimentoId}`);
    return response.data;
  }
};