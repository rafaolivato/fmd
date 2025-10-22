// src/store/services/alertaService.ts
import type { AlertaEstoque } from '../../types/AlertaEstoque';

// Mock - depois você integra com backend real
export const alertaService = {
  async getAlertasEstoque(): Promise<AlertaEstoque[]> {
    // Simula uma requisição
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock data - na prática viria do backend
    return [
      {
        medicamentoId: '1',
        principioAtivo: 'Dipirona',
        concentracao: '500mg',
        estoqueAtual: 5,
        estoqueMinimo: 10,
        estabelecimento: 'Farmácia Central'
      },
      {
        medicamentoId: '2', 
        principioAtivo: 'Paracetamol',
        concentracao: '750mg',
        estoqueAtual: 3,
        estoqueMinimo: 15,
        estabelecimento: 'Farmácia Central'
      }
    ];
  }
};