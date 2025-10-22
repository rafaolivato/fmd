// src/types/Dispensacao.ts
export interface ItemDispensacaoForm {
  medicamentoId: string;
  quantidadeSaida: number;
  loteId?: string; // Opcional - para seleção específica de lote
}

export interface DispensacaoFormData {
  pacienteNome: string;
  pacienteCpf?: string;
  profissionalSaude?: string;
  documentoReferencia: string;
  observacao?: string;
  itens: ItemDispensacaoForm[];
  estabelecimentoOrigemId: string;
}

export interface Dispensacao {
  id: string;
  pacienteNome: string;
  pacienteCpf?: string;
  profissionalSaude?: string;
  documentoReferencia: string;
  dataDispensacao: string;
  observacao?: string;
  estabelecimentoOrigemId: string;
  createdAt: string;
  updatedAt: string;
  
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