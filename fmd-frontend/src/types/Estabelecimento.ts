export interface Estabelecimento {
  id: string;
  nome: string;
  cnpj?: string;
  tipo: 'ALMOXARIFADO' | 'FARMACIA_UNIDADE' | string; // Adicione esta linha
  createdAt: string;
  updatedAt: string;
}