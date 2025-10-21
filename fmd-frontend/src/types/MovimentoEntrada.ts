// src/types/MovimentoEntrada.ts
export interface ItemMovimentoEntrada {
  medicamentoId: string;
  valorUnitario: number;
  fabricante: string;
  numeroLote: string;
  dataValidade: string;
  quantidade: number;
  localizacaoFisica?: string;
}

export interface MovimentoEntradaFormData {
  estabelecimentoId: string;
  tipoMovimentacao: string;
  fonteFinanciamento: string;
  fornecedor: string;
  documentoTipo: string;
  numeroDocumento: string;
  dataDocumento: string;
  dataRecebimento: string;
  valorTotal: number;
  observacao?: string;
  itens: ItemMovimentoEntrada[];
}

export interface MovimentoEntrada {
  id: string;
  tipoMovimentacao: string;
  fonteFinanciamento: string;
  fornecedor: string;
  documentoTipo: string;
  numeroDocumento: string;
  dataDocumento: string;
  dataRecebimento: string;
  valorTotal: number;
  observacao?: string;
  estabelecimentoId: string;
  createdAt: string;
  itens: ItemMovimentoEntrada[];
}