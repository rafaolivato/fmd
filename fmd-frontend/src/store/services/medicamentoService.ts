import { api } from './api';
import type { Medicamento, MedicamentoFormData } from '../../types/Medicamento';

export const medicamentoService = {
  // Listar todos os medicamentos
  async getAll(): Promise<Medicamento[]> {
    const response = await api.get('/medicamentos');
    return response.data;
  },

  // Criar novo medicamento
  async create(data: MedicamentoFormData): Promise<Medicamento> {
    const response = await api.post('/medicamentos', data);
    return response.data;
  },

  // Atualizar medicamento
  async update(id: string, data: MedicamentoFormData): Promise<Medicamento> {
    const response = await api.put(`/medicamentos/${id}`, data);
    return response.data;
  },

  // Deletar medicamento
  async delete(id: string): Promise<void> {
    await api.delete(`/medicamentos/${id}`);
  },

  // Buscar medicamento por ID
  async getById(id: string): Promise<Medicamento> {
    const response = await api.get(`/medicamentos/${id}`);
    return response.data;
  }
};