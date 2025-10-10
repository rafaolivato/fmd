export interface IItemDispensacaoDTO {
  medicamentoId: string; // O ID do medicamento
  quantidadeSaida: number; // Quantidade total a ser dispensada
}

// Interface para o cabeçalho da Dispensação (Receituário)
export interface ICreateDispensacaoDTO {
  pacienteNome: string;
  pacienteCpf?: string;
  profissionalSaude?: string;
  documentoReferencia: string;
  observacao?: string;

  // Itens que serão baixados
  itens: IItemDispensacaoDTO[]; 
}