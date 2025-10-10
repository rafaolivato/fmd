// src/modules/estabelecimentos/dtos/ICreateEstabelecimentoDTO.ts

export interface ICreateEstabelecimentoDTO {
  nome: string;
  cnpj?: string;
  tipo: 'ALMOXARIFADO' | 'FARMACIA_UNIDADE' | 'OUTRO'; // Use enum ou string literal
}