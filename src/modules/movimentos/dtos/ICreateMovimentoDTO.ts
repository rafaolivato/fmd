// 1. Interface para o Detalhe de Cada Item/Lote
export interface IItemMovimentoDTO {
    medicamentoId: string; // O ID do Medicamento (UUID)
    valorUnitario: number;
    fabricante: string;
    numeroLote: string;
    dataValidade: string;
    quantidade: number;
    localizacaoFisica: string;
  }
  
  // 2. Interface para o Cabeçalho da Movimentação
  export interface ICreateMovimentoEntradaDTO {
    // Dados da Transação Geral
    tipoMovimentacao: string;
    fonteFinanciamento: string;
    fornecedor: string;
    documentoTipo: string;
    numeroDocumento: string;
    dataDocumento: string;
    dataRecebimento: string;
    valorTotal: number;
    observacao?: string; // Opcional

    estabelecimentoId: string; // O estabelecimento onde a movimentação ocorre
  
    // Itens que fazem parte desta movimentação
    itens: IItemMovimentoDTO[]; 
  }