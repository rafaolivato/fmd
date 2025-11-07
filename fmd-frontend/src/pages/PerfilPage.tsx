import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaStore, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { authService } from '../store/services/authService';

const PerfilPage: React.FC = () => {
  const navigate = useNavigate();
  const usuario = authService.getUserFromStorage();

  if (!usuario) {
    navigate('/login');
    return null;
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
        <p></p>
          <Button variant="outline-primary" onClick={() => navigate(-1)}>
            <FaArrowLeft className="me-2" />
            Voltar
          </Button>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FaUser className="me-2" />
                Meu Perfil
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <strong>Nome:</strong>
                <div className="text-muted">{usuario.name}</div>
              </div>
              <div className="mb-3">
                <strong><FaEnvelope className="me-2" />Email:</strong>
                <div className="text-muted">{usuario.email}</div>
              </div>
              <div className="mb-3">
                <strong><FaStore className="me-2" />Estabelecimento:</strong>
                <div className="text-muted">{usuario.estabelecimento?.nome}</div>
              </div>
              <div>
                <strong>Tipo:</strong>
                <div className="text-muted">{usuario.estabelecimento?.tipo}</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PerfilPage;