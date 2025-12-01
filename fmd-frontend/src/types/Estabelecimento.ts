export type TipoEstabelecimento = "ALMOXARIFADO" | "FARMACIA_UNIDADE" | "OUTRO";

export interface Estabelecimento {
  id: string;
  nome: string;
  cnes?: string;
  tipo: TipoEstabelecimento;
  createdAt: string;
  updatedAt: string;
}
