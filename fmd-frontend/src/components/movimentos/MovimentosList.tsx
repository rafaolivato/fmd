import React from 'react';
import { Card, Table, Badge, Button } from 'react-bootstrap';
import type { Movimento } from '../../types/Movimento';
import { FaEye, FaFileAlt } from 'react-icons/fa';

interface MovimentosListProps {
  movimentos: Movimento[];
  onViewDetails: (movimento: Movimento) => void;
  isLoading?: boolean;
}

const MovimentosList: React.FC<MovimentosListProps> = ({
  movimentos,
  onViewDetails,
  isLoading = false
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getTipoBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case 'ENTRADA': return 'success';
      case 'SAIDA': return 'warning';
      case 'DISPENSACAO': return 'info';
      default: return 'secondary';
    }
  };

  const getTotalItens = (movimento: Movimento) => {
    return movimento.itensMovimentados.reduce((total, item) => total + item.quantidade, 0);
  };

  if (isLoading) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-2">Carregando movimentos...</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">Movimentações</h5>
        <Badge bg="light" text="dark">
          {movimentos.length} registros
        </Badge>
      </Card.Header>
      <Card.Body className="p-0">
        {movimentos.length === 0 ? (
          <div className="text-center py-5">
            <FaFileAlt size={48} className="text-muted mb-3" />
            <p className="text-muted">Nenhuma movimentação encontrada.</p>
          </div>
        ) : (
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
                        <small className="text-muted">Doc:</small>
                        <div>{formatDate(movimento.dataDocumento)}</div>
                      </div>
                      <div>
                        <small className="text-muted">Receb:</small>
                        <div>{formatDate(movimento.dataRecebimento)}</div>
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
                          <div>{movimento.fornecedor}</div>
                          <small className="text-muted">{movimento.fonteFinanciamento}</small>
                        </div>
                      ) : (
                        <div className="text-truncate" style={{ maxWidth: '200px' }}>
                          {movimento.observacao}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="fw-semibold">{getTotalItens(movimento)} unidades</div>
                      <small className="text-muted">
                        {movimento.itensMovimentados.length} medicamento(s)
                      </small>
                    </td>
                    <td className="fw-semibold">
                      {formatCurrency(movimento.valorTotal)}
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
        )}
      </Card.Body>
    </Card>
  );
};

export default MovimentosList;