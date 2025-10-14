// src/modules/requisicoes/dtos/ICreateRequisicaoDTO.ts

// 1. O que é solicitado em cada linha
export interface IItemRequisicaoDTO {
  medicamentoId: string;
  quantidadeSolicitada: number;
}

// 2. O cabeçalho da Requisição
export interface ICreateRequisicaoDTO {
  solicitanteId: string; // ID da Farmácia/UBS que está solicitando
  atendenteId: string;   // ID do Almoxarifado/Estoque de Origem que deve atender
  observacao?: string;   // Campo que você pode adicionar para observações
  
  itens: IItemRequisicaoDTO[];
}