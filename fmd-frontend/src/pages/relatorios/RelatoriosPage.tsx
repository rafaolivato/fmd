import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaBox, FaExchangeAlt, FaCapsules, FaChartBar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const RelatoriosPage: React.FC = () => {
  const navigate = useNavigate();

  const relatorios = [
    {
      titulo: 'Posição de Estoque',
      descricao: 'Relatório completo com medicamentos, lotes, validades e valores',
      icone: <FaBox size={32} className="text-primary" />,
      path: '/relatorios/posicao-estoque',
      cor: 'primary'
    },
    {
      titulo: 'Movimentações',
      descricao: 'Entradas, saídas e transferências por período',
      icone: <FaExchangeAlt size={32} className="text-success" />,
      path: '/relatorios/movimentacoes', 
      cor: 'success'
    },
    {
      titulo: 'Dispensações',
      descricao: 'Medicamentos dispensados por paciente e período',
      icone: <FaCapsules size={32} className="text-warning" />,
      path: '/relatorios/dispensacoes',
      cor: 'warning'
    }
  ];

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center mt-3">
            <FaChartBar size={32} className="text-primary me-3" />
            <div>
              <h1 className="h2 mb-0">Relatórios</h1>
              <p className="lead text-muted mb-0">Relatórios gerenciais do sistema</p>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        {relatorios.map((relatorio, index) => (
          <Col key={index} lg={4} md={6} className="mb-4">
            <Card 
              className="h-100 shadow-sm hover-card" 
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(relatorio.path)}
            >
              <Card.Body className="d-flex flex-column">
                <div className="d-flex align-items-center mb-3">
                  {relatorio.icone}
                  <h5 className="mb-0 ms-3">{relatorio.titulo}</h5>
                </div>
                <p className="text-muted flex-grow-1">{relatorio.descricao}</p>
                <div className={`badge bg-${relatorio.cor} mt-auto`}>
                  Acessar relatório
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <style>
        {`
          .hover-card:hover {
            transform: translateY(-2px);
            transition: transform 0.2s ease;
          }
        `}
      </style>
    </Container>
  );
};

export default RelatoriosPage;