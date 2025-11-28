export interface ICreateMedicamentoDTO {
  principioAtivo: string;
  concentracao: string;
  formaFarmaceutica: string;
  psicotropico: boolean;
  estoqueMinimo?: number;
  categoriaControladaId?: string;
}