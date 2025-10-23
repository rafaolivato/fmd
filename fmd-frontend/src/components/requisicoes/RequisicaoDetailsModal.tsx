import React from 'react';
import { Modal, Table, Badge, Row, Col, ProgressBar } from 'react-bootstrap';
import type { Requisicao } from '../../types/Requisicao';

interface RequisicaoDetailsModalProps {
  requisicao: Requisicao;
  show: boolean;
  onHide: () => void;
}

const RequisicaoDetailsModal: React.FC<RequisicaoDetailsModalProps> = ({
  requisicao,
  show,
  onHide
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
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

  const getPercentualAtendido = (item: Requisicao['itens'][0]) => {
    if (item.quantidadeSolicitada === 0) return 0;
    return (item.quantidadeAtendida / item.quantidadeSolicitada) * 100;
  };

  const getTotalSolicitado = () => {
    return requisicao.itens.reduce((total, item) => total + item.quantidadeSolicitada, 0);
  };

  const getTotalAtendido = () => {
    return requisicao.itens.reduce((total, item) => total + item.quantidadeAtendida, 0);
  };

  const getPercentualTotalAtendido = () => {
    const totalSolicitado = getTotalSolicitado();
    if (totalSolicitado === 0) return 0;
    return (getTotalAtendido() / totalSolicitado) * 100;
  };

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Detalhes da Requisição #{requisicao.id.substring(0, 8)}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Informações Gerais */}
        <Row className="mb-4">
          <Col md={6}>
            <h6>Solicitante</h6>
            <p className="fw-semibold">{requisicao.solicitante.nome}</p>
          </Col>
          <Col md={6}>
            <h6>Atendente</h6>
            <p className="fw-semibold">{requisicao.atendente.nome}</p>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col md={6}>
            <h6>Status</h6>
            <Badge bg={getStatusVariant(requisicao.status)} className="fs-6">
              {getStatusText(requisicao.status)}
            </Badge>
          </Col>
          <Col md={6}>
            <h6>Data de Solicitação</h6>
            <p>{formatDateTime(requisicao.dataSolicitacao)}</p>
          </Col>
        </Row>

        {/* Progresso Total */}
        <Row className="mb-4">
          <Col>
            <h6>Progresso do Atendimento</h6>
            <div className="d-flex justify-content-between mb-1">
              <small>Atendido: {getTotalAtendido()} de {getTotalSolicitado()}</small>
              <small>{getPercentualTotalAtendido().toFixed(1)}%</small>
            </div>
            <ProgressBar 
              now={getPercentualTotalAtendido()} 
              variant={
                getPercentualTotalAtendido() === 100 ? 'success' :
                getPercentualTotalAtendido() > 0 ? 'primary' : 'warning'
              }
            />
          </Col>
        </Row>

        {/* Itens da Requisição */}
        <h6 className="mb-3">Itens Solicitados</h6>
        <Table striped bordered>
          <thead>
            <tr>
              <th>Medicamento</th>
              <th>Quantidade Solicitada</th>
              <th>Quantidade Atendida</th>
              <th>Progresso</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {requisicao.itens.map((item, index) => (
              <tr key={item.id}>
                <td>
                  <div>
                    <strong>{item.medicamento.principioAtivo}</strong>
                  </div>
                  <small className="text-muted">
                    {item.medicamento.concentracao} - {item.medicamento.formaFarmaceutica}
                  </small>
                </td>
                <td className="text-center">
                  <Badge bg="secondary">{item.quantidadeSolicitada}</Badge>
                </td>
                <td className="text-center">
                  <Badge bg={
                    item.quantidadeAtendida === item.quantidadeSolicitada ? 'success' :
                    item.quantidadeAtendida > 0 ? 'primary' : 'warning'
                  }>
                    {item.quantidadeAtendida}
                  </Badge>
                </td>
                <td>
                  <div className="d-flex justify-content-between mb-1">
                    <small>{getPercentualAtendido(item).toFixed(0)}%</small>
                  </div>
                  <ProgressBar 
                    now={getPercentualAtendido(item)} 
                    variant={
                      getPercentualAtendido(item) === 100 ? 'success' :
                      getPercentualAtendido(item) > 0 ? 'primary' : 'warning'
                    }
                  />
                </td>
                <td>
                  <Badge bg={
                    item.quantidadeAtendida === item.quantidadeSolicitada ? 'success' :
                    item.quantidadeAtendida > 0 ? 'primary' : 'secondary'
                  }>
                    {item.quantidadeAtendida === item.quantidadeSolicitada ? 'Completo' :
                     item.quantidadeAtendida > 0 ? 'Parcial' : 'Pendente'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <div className="mt-3 text-end">
          <small className="text-muted">
            Requisição criada em: {formatDateTime(requisicao.createdAt)}
            {requisicao.updatedAt !== requisicao.createdAt && 
              ` • Atualizada em: ${formatDateTime(requisicao.updatedAt)}`
            }
          </small>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default RequisicaoDetailsModal;