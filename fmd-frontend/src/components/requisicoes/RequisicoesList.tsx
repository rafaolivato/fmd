import React from 'react';
import { Card, Table, Badge, Button } from 'react-bootstrap';
import type { Requisicao } from '../../types/Requisicao';
import { FaEye, FaStore, FaHandshake } from 'react-icons/fa';

interface RequisicoesListProps {
  requisicoes: Requisicao[];
  onViewDetails: (requisicao: Requisicao) => void;
  onAtender?: (requisicao: Requisicao) => void;
  isLoading?: boolean;
  modo: 'minhas' | 'para-atender'; // Para diferenciar a visualização
}

const RequisicoesList: React.FC<RequisicoesListProps> = ({
  requisicoes,
  onViewDetails,
  onAtender,
  isLoading = false,
  modo
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PENDENTE': return 'warning';
      case 'EM_SEPARACAO': return 'info';
      case 'ATENDIDA': return 'success';
      case 'ATENDIDA_PARCIALMENTE': return 'primary';
      case 'CANCELADA': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDENTE': return 'Pendente';
      case 'EM_SEPARACAO': return 'Em Separação';
      case 'ATENDIDA': return 'Atendida';
      case 'ATENDIDA_PARCIALMENTE': return 'Atendida Parcialmente';
      case 'CANCELADA': return 'Cancelada';
      default: return status;
    }
  };

  const getTotalItens = (requisicao: Requisicao) => {
    return requisicao.itens.length;
  };

  const getTotalQuantidadeSolicitada = (requisicao: Requisicao) => {
    return requisicao.itens.reduce((total, item) => total + item.quantidadeSolicitada, 0);
  };

  const getTotalQuantidadeAtendida = (requisicao: Requisicao) => {
    return requisicao.itens.reduce((total, item) => total + item.quantidadeAtendida, 0);
  };

  if (isLoading) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-2">Carregando requisições...</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">
          {modo === 'minhas' ? 'Minhas Requisições' : 'Requisições para Atender'}
        </h5>
        <Badge bg="light" text="dark">
          {requisicoes.length} requisições
        </Badge>
      </Card.Header>
      <Card.Body className="p-0">
        {requisicoes.length === 0 ? (
          <div className="text-center py-5">
            <FaStore size={48} className="text-muted mb-3" />
            <p className="text-muted">
              {modo === 'minhas' 
                ? 'Nenhuma requisição encontrada.' 
                : 'Nenhuma requisição pendente para atender.'
              }
            </p>
            <small className="text-muted">
              {modo === 'minhas'
                ? 'As requisições que você criar aparecerão aqui.'
                : 'As requisições direcionadas ao seu estabelecimento aparecerão aqui.'
              }
            </small>
          </div>
        ) : (
          <div className="table-responsive">
            <Table striped hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Data</th>
                  <th>ID</th>
                  {modo === 'minhas' ? <th>Atendente</th> : <th>Solicitante</th>}
                  <th>Itens</th>
                  <th>Quantidade</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {requisicoes.map((requisicao) => (
                  <tr key={requisicao.id}>
                    <td>
                      <div className="fw-semibold">{formatDate(requisicao.dataSolicitacao)}</div>
                    </td>
                    <td>
                      <code className="small">#{requisicao.id.substring(0, 8)}</code>
                    </td>
                    <td>
                      {modo === 'minhas' 
                        ? <div>{requisicao.atendente.nome}</div>
                        : <div>{requisicao.solicitante.nome}</div>
                      }
                    </td>
                    <td>
                      <div className="fw-semibold">{getTotalItens(requisicao)} itens</div>
                    </td>
                    <td>
                      <div>Solicitado: <strong>{getTotalQuantidadeSolicitada(requisicao)}</strong></div>
                      <div>Atendido: <strong>{getTotalQuantidadeAtendida(requisicao)}</strong></div>
                    </td>
                    <td>
                      <Badge bg={getStatusVariant(requisicao.status)}>
                        {getStatusText(requisicao.status)}
                      </Badge>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <Button
                          variant="outline-primary"
                          onClick={() => onViewDetails(requisicao)}
                          title="Ver detalhes"
                        >
                          <FaEye />
                        </Button>
                        {modo === 'para-atender' && requisicao.status === 'PENDENTE' && onAtender && (
                          <Button
                            variant="outline-success"
                            onClick={() => onAtender(requisicao)}
                            title="Atender requisição"
                          >
                            <FaHandshake />
                          </Button>
                        )}
                      </div>
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

export default RequisicoesList;