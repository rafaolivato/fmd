import { api } from './api';
import type { MovimentoEntrada, MovimentoEntradaFormData } from '../../types/MovimentoEntrada';

export const movimentoEntradaService = {
  async create(data: MovimentoEntradaFormData): Promise<MovimentoEntrada> {
    const response = await api.post('/movimentos/entrada', data);
    return response.data;
  },

  async getAll(): Promise<MovimentoEntrada[]> {
    const response = await api.get('/movimentos');
    return response.data;
  },

  async getById(id: string): Promise<MovimentoEntrada> {
    const response = await api.get(`/movimentos/${id}`);
    return response.data;
  }
};