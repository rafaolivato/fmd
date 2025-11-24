export interface EstoqueLote {
  id: string;
  medicamentoId: string;
  estabelecimentoId: string;
  quantidade: number;
  numeroLote: string;
  dataValidade: string;
  fabricante: string;
  valorUnitario: number;
  itemMovimentoEntradaId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EstoqueLocal {
  id: string;
  quantidade: number;
  medicamentoId: string;
  estabelecimentoId: string;
  createdAt: string;
  updatedAt: string;
  medicamento?: {
    principioAtivo: string;
    concentracao: string;
    formaFarmaceutica: string;
  };
}

export interface LoteSelecionado {
  loteId: string;
  numeroLote: string;
  dataValidade: string;
  quantidadeDisponivel: number;
  quantidadeSelecionada: number;
}