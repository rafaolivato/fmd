export interface ItemMovimento {
  id: string;
  valorUnitario: number;
  fabricante: string;
  numeroLote: string;
  dataValidade: string;
  quantidade: number;
  localizacaoFisica?: string;
  medicamentoId: string;
  movimentoId: string;
  medicamento: {
    principioAtivo: string;
    concentracao: string;
    formaFarmaceutica: string;
  };
}

export interface Movimento {
  id: string;
  tipoMovimentacao: string;
  fonteFinanciamento: string;
  fornecedor: string;
  fornecedorId: string;
  fornecedorNome?: string;
  documentoTipo: string;
  numeroDocumento: string;
  dataDocumento: string;
  dataRecebimento: string;
  valorTotal: number;
  observacao?: string;
  estabelecimentoId: string;
  createdAt: string;
  updatedAt: string;
  itensMovimentados: ItemMovimento[]; // ✅ Nome correto: itensMovimentados
}