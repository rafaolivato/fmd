// src/components/dashboard/AlertasEstoque.tsx
import React from 'react';
import { Card, ListGroup, Badge } from 'react-bootstrap';
import { FaExclamationTriangle, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';

interface AlertaEstoque {
  id: string;
  medicamento: string;
  quantidade: number;
  estoqueMinimo: number;
  tipo: 'CRITICO' | 'ALERTA' | 'ATENCAO';
}

interface AlertasEstoqueProps {
  alertas: AlertaEstoque[];
}

const AlertasEstoque: React.FC<AlertasEstoqueProps> = ({ alertas }) => {
  const getBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case 'CRITICO': return 'danger';
      case 'ALERTA': return 'warning';
      case 'ATENCAO': return 'info';
      default: return 'secondary';
    }
  };

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'CRITICO': return <FaExclamationTriangle className="text-danger" />;
      case 'ALERTA': return <FaExclamationCircle className="text-warning" />;
      case 'ATENCAO': return <FaInfoCircle className="text-info" />;
      default: return <FaInfoCircle />;
    }
  };

  if (alertas.length === 0) {
    return (
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">Alertas de Estoque</h5>
          <Badge bg="success">Tudo OK</Badge>
        </Card.Header>
        <Card.Body>
          <div className="text-center py-3">
            <p className="text-muted mb-0">Nenhum alerta de estoque no momento</p>
            <small className="text-muted">Todos os medicamentos com estoque adequado</small>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">Alertas de Estoque</h5>
        <Badge bg="danger">{alertas.length} alertas</Badge>
      </Card.Header>
      <ListGroup variant="flush">
        {alertas.map((alerta) => (
          <ListGroup.Item key={alerta.id} className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              {getIcon(alerta.tipo)}
              <div className="ms-3">
                <div className="fw-semibold">{alerta.medicamento}</div>
                <small className="text-muted">
                  Estoque: {alerta.quantidade} | Mínimo: {alerta.estoqueMinimo}
                </small>
              </div>
            </div>
            <Badge bg={getBadgeVariant(alerta.tipo)}>
              {alerta.tipo}
            </Badge>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Card>
  );
};

export default AlertasEstoque;