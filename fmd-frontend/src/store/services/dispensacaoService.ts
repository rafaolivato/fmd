import { api } from './api';
import type { Dispensacao, DispensacaoFormData } from '../../types/Dispensacao';

export const dispensacaoService = {
  async create(data: DispensacaoFormData): Promise<Dispensacao> {
    const response = await api.post('/dispensacoes', data);
    return response.data;
  },

  async getAll(): Promise<Dispensacao[]> {
    const response = await api.get('/dispensacoes');
    return response.data;
  },

  async getById(id: string): Promise<Dispensacao> {
    const response = await api.get(`/dispensacoes/${id}`);
    return response.data;
  }
};