// src/types/MovimentoSaida.ts
export interface ItemMovimentoSaida {
  medicamentoId: string;
  quantidadeSaida: number;
}

export interface MovimentoSaidaFormData {
  estabelecimentoId: string;
  tipoMovimentacao: string;
  documentoReferencia: string;
  dataMovimento: string;
  justificativa: string;
  observacao?: string;
  itens: ItemMovimentoSaida[];
}

export interface MovimentoSaida {
  id: string;
  tipoMovimentacao: string;
  documentoReferencia: string;
  dataMovimento: string;
  justificativa: string;
  observacao?: string;
  estabelecimentoId: string;
  createdAt: string;
  itens: ItemMovimentoSaida[];
}