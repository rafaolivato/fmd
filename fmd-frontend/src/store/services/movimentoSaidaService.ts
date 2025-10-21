// src/store/services/movimentoSaidaService.ts
import { api } from './api';
import type { MovimentoSaida, MovimentoSaidaFormData } from '../../types/MovimentoSaida';

export const movimentoSaidaService = {
  async create(data: MovimentoSaidaFormData): Promise<MovimentoSaida> {
    console.log('Enviando para /movimentos/saida:', data);
    const response = await api.post('/movimentos/saida', data);
    return response.data;
  },

  async getAll(): Promise<MovimentoSaida[]> {
    const response = await api.get('/movimentos');
    return response.data;
  },

  async getById(id: string): Promise<MovimentoSaida> {
    const response = await api.get(`/movimentos/${id}`);
    return response.data;
  }
};