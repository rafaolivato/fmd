import { api } from './api';
import type { Movimento } from '../../types/Movimento';

export const movimentoService = {
  async getAll(): Promise<Movimento[]> {
    const response = await api.get('/movimentos');
    return response.data;
  },

  async getById(id: string): Promise<Movimento> {
    const response = await api.get(`/movimentos/${id}`);
    return response.data;
  },

  async getByTipo(tipo: string): Promise<Movimento[]> {
    const response = await api.get(`/movimentos?tipo=${tipo}`);
    return response.data;
  }
};