export enum TipoSaidaDiversa {
  EMPRESTIMO = 'EMPRESTIMO',
  AJUSTE_NEGATIVO = 'AJUSTE_NEGATIVO', // Para reduzir saldo, ex: contagem deu a menos
  DOACAO = 'DOACAO',
  PERDA = 'PERDA',
  VALIDADE_VENCIDA = 'VALIDADE_VENCIDA',
}

export interface ILoteSaidaDTO {
  loteId: string;
  quantidade: number;
}

export interface IItemSaidaDiversaDTO {
  medicamentoId: string;
  quantidadeSaida: number; 
  valorUnitario: number; 
  lotes?: ILoteSaidaDTO[];
}

export interface ICreateMovimentoSaidaDTO {
  estabelecimentoId: string;
  tipoMovimentacao: TipoSaidaDiversa; 
  documentoReferencia?: string; 
  dataMovimento: Date | string; 
  justificativa: string; 
  observacao?: string; 
  itens: IItemSaidaDiversaDTO[];
}