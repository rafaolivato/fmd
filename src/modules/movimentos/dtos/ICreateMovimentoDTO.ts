// src/modules/movimentos/dtos/ICreateMovimentoDTO.ts

// 1. Interface para o Detalhe de Cada Item/Lote
export interface IItemMovimentoDTO {
    medicamentoId: string; // O ID do Medicamento (UUID)
    valorUnitario: number;
    fabricante: string;
    numeroLote: string;
    dataValidade: Date;
    quantidade: number;
    localizacaoFisica: string;
  }
  
  // 2. Interface para o Cabeçalho da Movimentação
  export interface ICreateMovimentoDTO {
    // Dados da Transação Geral
    tipoMovimentacao: string;
    fonteFinanciamento: string;
    fornecedor: string;
    documentoTipo: string;
    numeroDocumento: string;
    dataDocumento: Date;
    dataRecebimento: Date;
    valorTotal: number;
    observacao?: string; // Opcional
  
    // Itens que fazem parte desta movimentação
    itens: IItemMovimentoDTO[]; 
  }