import type { AlertaEstoque } from '../../types/AlertaEstoque';

export const alertaService = {
  async getAlertasEstoque(): Promise<AlertaEstoque[]> {
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
   
    return [
      
    ];
  }
};