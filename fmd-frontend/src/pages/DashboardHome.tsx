import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import AlertasEstoque from '../components/dashboard/AlertasEstoque';
import { FaBox, FaSignInAlt, FaSignOutAlt, FaCapsules } from 'react-icons/fa';

const DashboardHome: React.FC = () => {
  // Dados mock - depois você puxa do backend
  const metrics = {
    totalMedicamentos: 45,
    entradasHoje: 3,
    saidasHoje: 8,
    dispensacoesHoje: 12
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h1>Dashboard FMD</h1>
          <p className="lead">Visão geral do sistema farmacêutico</p>
        </Col>
      </Row>

      {/* Métricas Rápidas */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FaBox size={24} className="text-primary mb-2" />
              <h4>{metrics.totalMedicamentos}</h4>
              <p className="text-muted mb-0">Medicamentos</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FaSignInAlt size={24} className="text-success mb-2" />
              <h4>{metrics.entradasHoje}</h4>
              <p className="text-muted mb-0">Entradas Hoje</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FaSignOutAlt size={24} className="text-warning mb-2" />
              <h4>{metrics.saidasHoje}</h4>
              <p className="text-muted mb-0">Saídas Hoje</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FaCapsules size={24} className="text-info mb-2" />
              <h4>{metrics.dispensacoesHoje}</h4>
              <p className="text-muted mb-0">Dispensações Hoje</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Alertas de Estoque */}
      <Row>
        <Col md={6}>
          <AlertasEstoque />
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="card-title mb-0">Atividades Recentes</h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center py-4">
                <p className="text-muted">Em breve: atividades recentes do sistema</p>
                <small className="text-muted">
                  Últimas movimentações e dispensações aparecerão aqui
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardHome;