export interface ItemRequisicaoForm {
  medicamentoId: string;
  quantidadeSolicitada: number;
}

export interface ItemRequisicaoAtendimento {
  itemId: string;
  quantidadeAtendida: number;
}

export interface RequisicaoFormData {
  solicitanteId: string;
  atendenteId: string;
  observacao?: string;
  itens: ItemRequisicaoForm[];
}

export interface Requisicao {
  id: string;
  solicitanteId: string;
  atendenteId: string;
  status: 'PENDENTE' | 'EM_SEPARACAO' | 'ATENDIDA' |'ATENDIDA_PARCIALMENTE'| 'CANCELADA';
  dataSolicitacao: string;
  observacao?: string;
  createdAt: string;
  updatedAt: string;
  
  solicitante: {
    nome: string;
  };
  atendente: {
    nome: string;
  };
  itens: Array<{
    id: string;
    quantidadeSolicitada: number;
    quantidadeAtendida: number;
    medicamento: {
      id: string;
      principioAtivo: string;
      concentracao: string;
      formaFarmaceutica: string;
      psicotropico: boolean;
    };
  }>;
}