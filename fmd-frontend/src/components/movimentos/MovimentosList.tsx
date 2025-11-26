import React from 'react';
import { Card, Table, Badge, Button } from 'react-bootstrap';
import type { Movimento } from '../../types/Movimento';
import { FaEye, FaFileAlt } from 'react-icons/fa';
import { useFornecedores } from '../../hooks/useFornecedores'; // ✅ Import novo

interface MovimentosListProps {
  movimentos: Movimento[];
  onViewDetails: (movimento: Movimento) => void;
  isLoading?: boolean;
}

const MovimentosList: React.FC<MovimentosListProps> = ({
  movimentos = [],
  onViewDetails,
  isLoading = false
}) => {
  // ✅ NOVO: Hook para carregar nomes dos fornecedores
  const { fornecedores } = useFornecedores(movimentos);

  // Debug
  React.useEffect(() => {
    console.log('🔍 MovimentosList - Debug:', {
      movimentosCount: movimentos.length,
      isLoading,
      sample: movimentos[0],
      fornecedoresCount: Object.keys(fornecedores).length
    });
  }, [movimentos, isLoading, fornecedores]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        timeZone: 'America/Sao_Paulo'
      });
    } catch {
      return 'Data inválida';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const getTipoBadgeVariant = (tipo: string) => {
    switch (tipo?.toUpperCase()) {
      case 'ENTRADA': return 'success';
      case 'SAIDA': return 'warning';
      default: return 'secondary';
    }
  };

  const getTotalItens = (movimento: Movimento) => {
    return movimento.itensMovimentados?.reduce((total, item) => total + (item.quantidade || 0), 0) || 0;
  };

  const calcularValorTotal = (movimento: Movimento): number => {
    if (movimento.tipoMovimentacao === 'ENTRADA' && movimento.valorTotal && movimento.valorTotal > 0) {
      return movimento.valorTotal;
    }
    
    if (movimento.itensMovimentados && movimento.itensMovimentados.length > 0) {
      const total = movimento.itensMovimentados.reduce((sum, item) => {
        const quantidade = item.quantidade || 0;
        const valorUnitario = item.valorUnitario || movimento.valorTotal || 0;
        
        if (!valorUnitario && movimento.valorTotal && quantidade > 0) {
          return movimento.valorTotal;
        }
        
        return sum + (quantidade * valorUnitario);
      }, 0);
      
      return total;
    }
    
    return movimento.valorTotal || 0;
  };

  // ✅ CORREÇÃO: Função para obter nome do fornecedor
  const getNomeFornecedor = (movimento: Movimento): string => {
    if (movimento.fornecedorId && fornecedores[movimento.fornecedorId]) {
      return fornecedores[movimento.fornecedorId];
    }
    return movimento.fornecedor || 'Fornecedor não informado';
  };

  const getReferenciaSaida = (movimento: Movimento) => {
    if (movimento.tipoMovimentacao === 'SAIDA') {
      return movimento.observacao || 'Saída diversa';
    }
    return getNomeFornecedor(movimento); // ✅ Usa a função corrigida
  };

  const getFonteFinanciamentoFormatada = (fonte: string) => {
    const fontes: { [key: string]: string } = {
      'RECURSOS_PRO_PRIOS': 'Recursos Próprios',
      'RECURSOS_PRO PRIOS': 'Recursos Próprios',
      'SUS': 'SUS',
      'CONVENIO': 'Convênio',
      'DOACAO': 'Doação',
      'TRANSFERENCIA': 'Transferência'
    };
    return fontes[fonte] || fonte || 'Não informado';
  };

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-2 text-muted">Carregando movimentações...</p>
        </Card.Body>
      </Card>
    );
  }

  // Empty state
  if (movimentos.length === 0) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <FaFileAlt size={48} className="text-muted mb-3" />
          <h6 className="text-muted">Nenhuma movimentação encontrada</h6>
          <p className="text-muted small">
            Não há movimentações para exibir no momento.
          </p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">Movimentações</h5>
        <Badge bg="primary">
          {movimentos.length} registro{movimentos.length !== 1 ? 's' : ''}
        </Badge>
      </Card.Header>
      <Card.Body className="p-0">
        <div className="table-responsive">
          <Table striped hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>Documento</th>
                <th>Fornecedor/Referência</th>
                <th>Itens</th>
                <th>Valor Total</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {movimentos.map((movimento) => (
                <tr key={movimento.id}>
                  <td>
                    <div>
                      <small className="text-muted">Receb:</small>
                      <div>{formatDate(movimento.createdAt)}</div>
                    </div>
                  </td>
                  <td>
                    <Badge bg={getTipoBadgeVariant(movimento.tipoMovimentacao)}>
                      {movimento.tipoMovimentacao}
                    </Badge>
                  </td>
                  <td>
                    <div className="fw-semibold">{movimento.numeroDocumento}</div>
                    <small className="text-muted">{movimento.documentoTipo}</small>
                  </td>
                  <td>
                    {movimento.tipoMovimentacao === 'ENTRADA' ? (
                      <div>
                        {/* ✅ CORREÇÃO: Usa função para obter nome do fornecedor */}
                        <div className="fw-semibold">{getNomeFornecedor(movimento)}</div>
                        <small className="text-muted">
                          {getFonteFinanciamentoFormatada(movimento.fonteFinanciamento)}
                        </small>
                      </div>
                    ) : (
                      <div className="text-truncate" style={{ maxWidth: '200px' }}>
                        <div className="fw-semibold">
                          {getReferenciaSaida(movimento)}
                        </div>
                        {movimento.fonteFinanciamento && (
                          <small className="text-muted">
                            {getFonteFinanciamentoFormatada(movimento.fonteFinanciamento)}
                          </small>
                        )}
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="fw-semibold">{getTotalItens(movimento)} unidades</div>
                    <small className="text-muted">
                      {movimento.itensMovimentados?.length || 0} medicamento(s)
                    </small>
                  </td>
                  <td className="fw-semibold">
                    {formatCurrency(calcularValorTotal(movimento))}
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => onViewDetails(movimento)}
                      title="Ver detalhes"
                    >
                      <FaEye />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
};

export default MovimentosList;