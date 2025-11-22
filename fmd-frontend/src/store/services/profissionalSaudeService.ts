import type { ProfissionalSaude } from '../../types/ProfissionalSaude';

const API_BASE_URL = 'http://localhost:3333'; // ✅ Remove /api daqui

export const profissionalSaudeService = {
  async getAll(): Promise<ProfissionalSaude[]> {
    const response = await fetch(`${API_BASE_URL}/profissionais-saude`); // ✅ Agora sem /api
    if (!response.ok) {
      throw new Error('Erro ao carregar profissionais de saúde');
    }
    return response.json();
  },

  async getById(id: string): Promise<ProfissionalSaude> {
    const response = await fetch(`${API_BASE_URL}/profissionais-saude/${id}`);
    if (!response.ok) {
      throw new Error('Profissional não encontrado');
    }
    return response.json();
  },

  async create(profissional: Omit<ProfissionalSaude, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProfissionalSaude> {
    const response = await fetch(`${API_BASE_URL}/profissionais-saude`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profissional),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao criar profissional');
    }

    return response.json();
  },

  async update(id: string, profissional: Partial<ProfissionalSaude>): Promise<ProfissionalSaude> {
    const response = await fetch(`${API_BASE_URL}/profissionais-saude/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profissional),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao atualizar profissional');
    }

    return response.json();
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/profissionais-saude/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Erro ao deletar profissional');
    }
  },

  async search(termo: string): Promise<ProfissionalSaude[]> {
    const response = await fetch(`${API_BASE_URL}/profissionais-saude/buscar?termo=${encodeURIComponent(termo)}`);
    if (!response.ok) {
      throw new Error('Erro na busca de profissionais');
    }
    return response.json();
  }
};