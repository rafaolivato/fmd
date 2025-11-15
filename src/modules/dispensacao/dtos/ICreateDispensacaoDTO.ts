export interface IItemDispensacaoDTO {
  medicamentoId: string; // O ID do medicamento
  quantidadeSaida: number; // Quantidade total a ser dispensada
  loteId?: string;
}

// Interface para o cabeçalho da Dispensação (Receituário)
export interface ICreateDispensacaoDTO {
  pacienteNome: string;
  pacienteCpf?: string;
  profissionalSaude?: string;
  documentoReferencia: string;
  observacao?: string;

  estabelecimentoOrigemId: string;

  // Itens que serão baixados
  itens: IItemDispensacaoDTO[];
  
  justificativaRetiradaAntecipada?: string;
  usuarioAutorizador?: string;
}


