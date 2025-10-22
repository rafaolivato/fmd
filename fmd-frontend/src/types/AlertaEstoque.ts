// src/types/AlertaEstoque.ts
export interface AlertaEstoque {
  medicamentoId: string;
  principioAtivo: string;
  concentracao: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  estabelecimento: string;
}