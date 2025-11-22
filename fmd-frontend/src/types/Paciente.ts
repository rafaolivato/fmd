export interface Paciente {
  id: string;
  nome: string;
  cpf: string;
  dataNascimento: string; 
  telefone?: string;
  email?: string;
  endereco?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PacienteFormData {
  nome: string;
  cpf: string;
  dataNascimento: string;
  endereco?: string;
}