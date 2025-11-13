import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import AlertasEstoque from '../components/dashboard/AlertasEstoque';
import { FaBox, FaSignInAlt, FaSignOutAlt, FaCapsules, FaTachometerAlt } from 'react-icons/fa';
import { dashboardService, type DashboardMetrics } from '../store/services/dashboardService';

const DashboardHome: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await dashboardService.getMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Container fluid>
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </Spinner>
          <p className="mt-2">Carregando dashboard...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid>
        <Alert variant="danger">
          <Alert.Heading>Erro</Alert.Heading>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadDashboardData}>
            Tentar Novamente
          </button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row className="mb-4">
      <Col>
        <div className="d-flex align-items-center mt-3">
          <FaTachometerAlt size={32} className="text-primary me-3" />
          <div>
            <h1 className="h2 mb-0">Dashboard FMD</h1>
            <p className="lead text-muted mb-0">Visão geral do sistema farmacêutico</p>
          </div>
        </div>
      </Col>
    </Row>

      {/* Métricas Rápidas */ }
  <Row className="mb-4">
    <Col md={3}>
      <Card className="text-center">
        <Card.Body>
          <FaBox size={24} className="text-primary mb-2" />
          <h4>{metrics?.totalMedicamentos || 0}</h4>
          <p className="text-muted mb-0">Medicamentos</p>
        </Card.Body>
      </Card>
    </Col>
    <Col md={3}>
      <Card className="text-center">
        <Card.Body>
          <FaSignInAlt size={24} className="text-success mb-2" />
          <h4>{metrics?.entradasHoje || 0}</h4>
          <p className="text-muted mb-0">Entradas Hoje</p>
        </Card.Body>
      </Card>
    </Col>
    <Col md={3}>
      <Card className="text-center">
        <Card.Body>
          <FaSignOutAlt size={24} className="text-warning mb-2" />
          <h4>{metrics?.saidasHoje || 0}</h4>
          <p className="text-muted mb-0">Saídas Hoje</p>
        </Card.Body>
      </Card>
    </Col>
    <Col md={3}>
      <Card className="text-center">
        <Card.Body>
          <FaCapsules size={24} className="text-info mb-2" />
          <h4>{metrics?.dispensacoesHoje || 0}</h4>
          <p className="text-muted mb-0">Dispensações Hoje</p>
        </Card.Body>
      </Card>
    </Col>
  </Row>

  {/* Alertas de Estoque e Atividades */ }
  <Row>
    <Col md={6}>
      <AlertasEstoque alertas={metrics?.alertasEstoque || []} />
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
    </Container >
  );
};

export default DashboardHome;