// src/modules/medicamentos/dtos/ICreateMedicamentoDTO.ts

export interface ICreateMedicamentoDTO {
    principioAtivo: string; 
    concentracao: string;
    formaFarmaceutica: string;
    psicotropico: boolean; 
  }