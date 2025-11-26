import React from 'react';
import { Card, Button } from 'react-bootstrap';
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
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#f8f9fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        zIndex: 1050 // Para garantir que fique acima de tudo
      }}
    >
      <div style={{ 
        maxWidth: '500px', 
        width: '100%',
      }}>
        <div className="mb-4">
          <Button variant="outline-primary" onClick={() => navigate(-1)}>
            <FaArrowLeft className="me-2" />
            Voltar
          </Button>
        </div>

        <Card className="shadow-lg border-0">
          <Card.Header className="bg-primary text-white py-3">
            <h4 className="mb-0 fw-bold">
              <FaUser className="me-2" />
              Meu Perfil
            </h4>
          </Card.Header>
          <Card.Body className="p-4">
            <div className="mb-3">
              <strong className="text-primary">Nome:</strong>
              <div className="text-dark mt-1 fs-5">{usuario.name}</div>
            </div>
            
            <div className="mb-3">
              <strong className="text-primary">
                <FaEnvelope className="me-2" />
                Email:
              </strong>
              <div className="text-dark mt-1 fs-5">{usuario.email}</div>
            </div>
            
            <div className="mb-3">
              <strong className="text-primary">
                <FaStore className="me-2" />
                Estabelecimento:
              </strong>
              <div className="text-dark mt-1 fs-5">{usuario.estabelecimento?.nome}</div>
            </div>
            
            <div>
              <strong className="text-primary">Tipo:</strong>
              <div className="text-dark mt-1 fs-5">{usuario.estabelecimento?.tipo}</div>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}

export default PerfilPage;