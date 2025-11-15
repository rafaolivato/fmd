// frontend/src/store/services/retiradaService.ts
import { api } from './api';

export interface RetiradaRecenteResponse {
  existeRetirada: boolean;
  ultimaDispensacao?: any;
  diasDesdeUltimaRetirada?: number;
  mensagem?: string;
}

export interface VerifyRetiradaRequest {
  pacienteCpf: string;
  medicamentoId: string;
  estabelecimentoId: string;
}

class RetiradaService {
  async verifyRetiradaRecente(data: VerifyRetiradaRequest): Promise<RetiradaRecenteResponse> {
    const response = await api.post('/dispensacoes/verify-retirada-recente', data);
    return response.data;
  }
}

export const retiradaService = new RetiradaService();