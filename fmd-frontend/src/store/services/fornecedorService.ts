import { api } from './api';
import type { Fornecedor, FornecedorFormData } from '../../types/Fornecedor';

export const fornecedorService = {
  async getAll(): Promise<Fornecedor[]> {
    const response = await api.get('/fornecedores');
    return response.data;
  },

  async create(data: FornecedorFormData): Promise<Fornecedor> {
    const response = await api.post('/fornecedores', data);
    return response.data;
  },

  async update(id: string, data: FornecedorFormData): Promise<Fornecedor> {
    const response = await api.put(`/fornecedores/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/fornecedores/${id}`);
  }
};