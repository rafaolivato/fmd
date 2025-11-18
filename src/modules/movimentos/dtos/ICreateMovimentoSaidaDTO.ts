export enum TipoSaidaDiversa {
  EMPRESTIMO = 'EMPRESTIMO',
  AJUSTE_NEGATIVO = 'AJUSTE_NEGATIVO', // Para reduzir saldo, ex: contagem deu a menos
  DOACAO = 'DOACAO',
  PERDA = 'PERDA',
  VALIDADE_VENCIDA = 'VALIDADE_VENCIDA',
}

/**
 * Interface que representa a estrutura de um item de saída em lotes,
 * com foco na quantidade que será baixada.
 * Corresponde ao IItemSaidaDiversaDTO fornecido pelo usuário.
 */
export interface IItemSaidaDiversaDTO {
  medicamentoId: string;
  // Quantidade total a ser retirada. Deve ser um valor numérico válido.
  quantidadeSaida: number; 
  // Valor unitário é obrigatório no modelo do usuário para cálculo de custo ou venda.
  valorUnitario: number; 
}

/**
 * Interface que representa os dados recebidos do frontend (MovimentoSaidaFormData)
 * para a criação de um novo movimento de saída no estoque.
 * Corresponde ao ICreateMovimentoSaidaDTO fornecido pelo usuário.
 */
export interface ICreateMovimentoSaidaDTO {
  estabelecimentoId: string;
  // Usando o enum TipoSaidaDiversa para tipos aceitos.
  tipoMovimentacao: TipoSaidaDiversa; 
  
  // Opcional, será gerado se vazio no serviço.
  documentoReferencia?: string; 
  // O serviço fará a conversão para Date.
  dataMovimento: Date | string; 
  // Obrigatório para saídas.
  justificativa: string; 
  // Opcional.
  observacao?: string; 
  
  itens: IItemSaidaDiversaDTO[];
}