// src/modules/estabelecimentos/dtos/ICreateEstabelecimentoDTO.ts

export interface ICreateEstabelecimentoDTO {
  nome: string;
  cnes?: string;
  tipo: 'ALMOXARIFADO' | 'FARMACIA_UNIDADE' | 'OUTRO'; // Use enum ou string literal
}