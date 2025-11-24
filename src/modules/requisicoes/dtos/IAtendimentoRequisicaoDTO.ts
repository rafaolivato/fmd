export interface LoteAtendimentoDTO {
  loteId: string;
  quantidade: number;
  numeroLote: string;
}

export interface IItemAtendidoDTO {
  itemId: string;              // O ID do ItemRequisicao (não do medicamento!)
  quantidadeAtendida: number;  // A quantidade real que o almoxarifado está enviando
  lotes?: LoteAtendimentoDTO[];
}

// Define a estrutura do body da requisição PATCH
export interface IAtendimentoRequisicaoDTO {
  itensAtendidos: IItemAtendidoDTO[];
}