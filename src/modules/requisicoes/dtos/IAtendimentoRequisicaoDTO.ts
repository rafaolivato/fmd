export interface IItemAtendidoDTO {
  itemId: string;              // O ID do ItemRequisicao (não do medicamento!)
  quantidadeAtendida: number;  // A quantidade real que o almoxarifado está enviando
}

// Define a estrutura do body da requisição PATCH
export interface IAtendimentoRequisicaoDTO {
  itensAtendidos: IItemAtendidoDTO[];
}