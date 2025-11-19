export interface Medicamento {
    id?: string;
    principioAtivo: string;
    concentracao: string;
    formaFarmaceutica: string;
    psicotropico: boolean;
    quantidadeEstoque?: number;
    estoqueMinimo: number;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface MedicamentoFormData {
    principioAtivo: string;
    concentracao: string;
    formaFarmaceutica: string;
    psicotropico: boolean;
    estoqueMinimo: number;
  }