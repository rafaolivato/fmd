// Os tipos de saída diversas
export enum TipoSaidaDiversa {
  EMPRESTIMO = 'EMPRESTIMO',
  AJUSTE_NEGATIVO = 'AJUSTE_NEGATIVO', // Para reduzir saldo, ex: contagem deu a menos
  DOACAO = 'DOACAO',
  PERDA = 'PERDA',
  VALIDADE_VENCIDA = 'VALIDADE_VENCIDA',
}

// DTO para os itens que serão retirados
export interface IItemSaidaDiversaDTO {
  medicamentoId: string;
  quantidadeSaida: number; // Quantidade total a ser retirada (ex: 50)
  // Nota: Não precisamos de 'loteId' forçado, pois a saída diversa deve priorizar o FIFO.
}

// DTO principal para a requisição de Saída
export interface ICreateMovimentoSaidaDTO {
  estabelecimentoId: string;
  tipoMovimentacao: TipoSaidaDiversa;
  
  // Campos de rastreabilidade (documento e justificativa)
  documentoReferencia: string; // Ex: Número de Protocolo, Número de Ajuste
  dataMovimento: Date | string; 
  justificativa: string;
  observacao?: string;

  itens: IItemSaidaDiversaDTO[];
}