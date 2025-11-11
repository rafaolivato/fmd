export interface Fornecedor {
  id: string;
  nome: string;
  cnpj: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FornecedorFormData {
  nome: string;
  cnpj: string;
  telefone?: string;
  email?: string;
  endereco?: string;
}