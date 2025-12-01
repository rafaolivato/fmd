import React from 'react';
import { Modal, Table, Badge, Row, Col } from 'react-bootstrap';
import type { Dispensacao } from '../../types/Dispensacao';

interface DispensacaoDetailsModalProps {
  dispensacao: Dispensacao;
  show: boolean;
  onHide: () => void;
}

const DispensacaoDetailsModal: React.FC<DispensacaoDetailsModalProps> = ({
  dispensacao,
  show,
  onHide
}) => {
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Detalhes da Dispensação</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Informações Gerais */}
        <Row className="mb-4">
          <Col md={6}>
            <h6>Paciente</h6>
            <p className="fw-semibold">{dispensacao.pacienteNome}</p>
            {dispensacao.pacienteCpf && (
              <p className="text-muted">CPF: {dispensacao.pacienteCpf}</p>
            )}
          </Col>
          <Col md={6}>
            <h6>Documento</h6>
            <p className="fw-semibold">{dispensacao.documentoReferencia}</p>
            {dispensacao.profissionalSaude && (
              <p className="text-muted">Profissional: {dispensacao.profissionalSaudeNome}</p>
            )}
          </Col>
        </Row>

        <Row className="mb-4">
          <Col md={6}>
            <h6>Estabelecimento</h6>
            <p>{dispensacao.estabelecimentoOrigem.nome}</p>
          </Col>
          <Col md={6}>
            <h6>Data/Hora</h6>
            <p>{formatDateTime(dispensacao.dataDispensacao)}</p>
          </Col>
        </Row>

        {dispensacao.observacao && (
          <Row className="mb-4">
            <Col>
              <h6>Observações</h6>
              <p>{dispensacao.observacao}</p>
            </Col>
          </Row>
        )}

        {/* Medicamentos Dispensados */}
        <h6 className="mb-3">Medicamentos Dispensados</h6>
        <Table striped bordered>
          <thead>
            <tr>
              <th>Medicamento</th>
              <th>Lote</th>
              <th>Quantidade</th>
            </tr>
          </thead>
          <tbody>
            {dispensacao.itensDispensados.map((item, index) => (
              <tr key={index}>
                <td>
                  <div>
                    <strong>{item.medicamento.principioAtivo}</strong>
                  </div>
                  <small className="text-muted">
                    {item.medicamento.concentracao} - {item.medicamento.formaFarmaceutica}
                  </small>
                </td>

                <td>
                  <Badge bg="secondary">{item.lote?.numeroLote || item.loteNumero}</Badge>
                </td>
                <td>
                  <Badge bg="primary">{item.quantidadeSaida} unidades</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <div className="mt-3 text-end">
          <small className="text-muted">
            Registrado em: {formatDateTime(dispensacao.createdAt)}
          </small>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default DispensacaoDetailsModal;