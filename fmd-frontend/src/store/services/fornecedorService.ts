// fornecedorService.ts
import { api } from './api';
import type { Fornecedor, FornecedorFormData } from '../../types/Fornecedor';


const cache: { fornecedores: Fornecedor[] | null; timestamp: number } = {
  fornecedores: null,
  timestamp: 0
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const fornecedorService = {
  async getAll(forceRefresh = false): Promise<Fornecedor[]> {
    const now = Date.now();
    
    // Usa cache se ainda é válido e não for forçado refresh
    if (!forceRefresh && cache.fornecedores && (now - cache.timestamp) < CACHE_DURATION) {
      return cache.fornecedores;
    }

    const response = await api.get('/fornecedores');
    cache.fornecedores = response.data;
    cache.timestamp = now;
    
    return response.data;
  },

  async getById(id: string): Promise<Fornecedor> {
    try {
      const fornecedores = await this.getAll();
      const fornecedor = fornecedores.find(f => f.id === id);
      
      if (!fornecedor) {
        throw new Error(`Fornecedor com ID ${id} não encontrado`);
      }
      
      return fornecedor;
    } catch (error) {
      console.error('Erro ao buscar fornecedor:', error);
      throw error;
    }
  },

  async getFornecedorNomeById(id: string): Promise<string> {
    try {
      const fornecedor = await this.getById(id);
      return fornecedor.nome;
    } catch (error) {
      console.error('Erro ao buscar fornecedor:', error);
      return 'Fornecedor não encontrado';
    }
  },

  async create(data: FornecedorFormData): Promise<Fornecedor> {
    const response = await api.post('/fornecedores', data);
    // Invalida o cache após criar novo fornecedor
    cache.fornecedores = null;
    return response.data;
  },

  async update(id: string, data: FornecedorFormData): Promise<Fornecedor> {
    const response = await api.put(`/fornecedores/${id}`, data);
    // Invalida o cache após atualizar
    cache.fornecedores = null;
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/fornecedores/${id}`);
    // Invalida o cache após deletar
    cache.fornecedores = null;
  },

  // Método para limpar cache manualmente
  clearCache(): void {
    cache.fornecedores = null;
    cache.timestamp = 0;
  }
};