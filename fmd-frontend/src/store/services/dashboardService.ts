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
    try {
      console.log('🔄 [FRONTEND] Iniciando busca das métricas...');
      
      const response = await api.get('/dashboard/metrics');
      
       console.log('✅ [DASHBOARD] Métricas recebidas:', {
        totalMedicamentos: response.data.totalMedicamentos,
        entradasHoje: response.data.entradasHoje,
        saidasHoje: response.data.saidasHoje,
        dispensacoesHoje: response.data.dispensacoesHoje,
        alertas: response.data.alertasEstoque?.length || 0
      });
      
      console.log('📊 [FRONTEND] Status:', response.status);
      
      return response.data;
      
    } catch (error: any) {
      console.error('❌ [FRONTEND] Erro completo:', error);
      
      // Log detalhado do erro
      console.log('🔍 [FRONTEND] Detalhes do erro:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        message: error.message
      });
      
      // Verifica se é erro de CORS
      if (error.message?.includes('Network Error') || error.message?.includes('CORS')) {
        throw new Error('Erro de conexão/CORS. Verifique se o backend está rodando e acessível.');
      }
      
      throw new Error(
        error.response?.data?.message || 
        `Erro ${error.response?.status || 'N/A'}: ${error.message}`
      );
    }
  }
};