import { type ProfissionalSaude } from './ProfissionalSaude';

export interface LoteDispensacaoForm {
  loteId: string;
  numeroLote: string;
  quantidadeSelecionada: number;
}

export interface ItemDispensacaoForm {
  medicamentoId: string;
  quantidadeSaida: number;
  lotesSelecionados?: LoteDispensacaoForm[]; 
}

export interface DispensacaoFormData {
  pacienteNome: string;
  pacienteCpf?: string;
  pacienteId?: string; 
  profissionalSaudeId?: string;       
  profissionalSaudeNome?: string;     
  documentoReferencia: string;
  observacao?: string;
  itens: ItemDispensacaoForm[];
  estabelecimentoOrigemId: string;
  justificativaRetiradaAntecipada?: string;
  usuarioAutorizador?: string;
}

// ✅ NOVO: Interface para enviar ao backend
export interface DispensacaoCreateData {
  pacienteNome: string;
  pacienteCpf?: string;
  pacienteId?: string;
  profissionalSaudeId?: string;
  profissionalSaudeNome?: string;
  documentoReferencia: string;
  observacao?: string;
  itens: Array<{
    medicamentoId: string;
    quantidadeSaida: number;
    lotes?: Array<{
      loteId: string;
      numeroLote: string;
      quantidade: number;
    }>;
  }>;
  estabelecimentoOrigemId: string;
  justificativaRetiradaAntecipada?: string;
  usuarioAutorizador?: string;
}

export interface Dispensacao {
  id: string;
  pacienteNome: string;
  pacienteCpf?: string;
  profissionalSaudeId?: string;
  profissionalSaude?: ProfissionalSaude;
  profissionalSaudeNome?: string;
  documentoReferencia: string;
  dataDispensacao: string;
  observacao?: string;
  estabelecimentoOrigemId: string;
  createdAt: string;
  updatedAt: string;

  justificativaRetiradaAntecipada?: string;
  usuarioAutorizador?: string;
  dataAutorizacao?: string;
  
  itensDispensados: Array<{
    id: string;
    quantidadeSaida: number;
    loteNumero: string;
    lote?: { // ← NOVO: objeto lote completo
      id: string;
      numeroLote: string;
    };
    medicamento: {
      principioAtivo: string;
      concentracao: string;
      formaFarmaceutica: string;
    };
  }>;
  
  estabelecimentoOrigem: {
    nome: string;
  };
}