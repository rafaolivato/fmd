import { type ProfissionalSaude } from './ProfissionalSaude';

export interface ItemDispensacaoForm {
  medicamentoId: string;
  quantidadeSaida: number;
  loteId?: string; // Opcional - para seleção específica de lote
}

export interface DispensacaoFormData {
  pacienteNome: string;
  pacienteCpf?: string;
  pacienteId?: string; 
  profissionalSaudeId?: string;        // ID do profissional cadastrado
  profissionalSaudeNome?: string;     
  documentoReferencia: string;
  observacao?: string;
  itens: ItemDispensacaoForm[];
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