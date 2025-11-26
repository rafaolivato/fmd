export interface Estabelecimento {
  id: string;
  nome: string;
  cnes?: string;
  tipo: 'ALMOXARIFADO' | 'FARMACIA UNIDADE' | string; 
  createdAt: string;
  updatedAt: string;
}