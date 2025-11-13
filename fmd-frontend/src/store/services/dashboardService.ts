import { api } from './api';

export interface DashboardMetrics {
  totalMedicamentos: number;
  entradasHoje: number;
  saidasHoje: number;
  dispensacoesHoje: number;
  alertasEstoque: Array<{
    id: string;
    medicamento: string;
    quantidade: number;
    estoqueMinimo: number;
    tipo: 'CRITICO' | 'ALERTA' | 'ATENCAO';
  }>;
}

export const dashboardService = {
  async getMetrics(): Promise<DashboardMetrics> {
    const response = await api.get('/dashboard/metrics');
    return response.data;
  },

  async getAlertasEstoque() {
    const response = await api.get('/dashboard/alertas-estoque');
    return response.data;
  }
};