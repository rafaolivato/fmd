import { api } from './api';
import type { Estabelecimento } from '../../types/Estabelecimento';

export const estabelecimentoService = {
  async getAll(): Promise<Estabelecimento[]> {
    const response = await api.get('/estabelecimentos');
    return response.data;
  },

  async getById(id: string): Promise<Estabelecimento> {
    const response = await api.get(`/estabelecimentos/${id}`);
    return response.data;
  }
};