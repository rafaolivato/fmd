import { api } from './api';
import type { Paciente, PacienteFormData } from '../../types/Paciente';

export const pacienteService = {
  async getAll(): Promise<Paciente[]> {
    try {
      const response = await api.get('/pacientes');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
      return []; // Retorna array vazio se não existir a rota ainda
    }
  },

  async create(data: PacienteFormData): Promise<Paciente> {
    const response = await api.post('/pacientes', data);
    return response.data;
  },

  async update(id: string, data: PacienteFormData): Promise<Paciente> {
    const response = await api.put(`/pacientes/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/pacientes/${id}`);
  }
};