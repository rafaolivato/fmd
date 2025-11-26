import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../store/slices/authSlice';
import type { AppDispatch, RootState } from '../store/store';
import { useNavigate } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';

const Login: React.FC = () => {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { loading, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  if (isAuthenticated) {
    navigate('/dashboard');
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    dispatch(loginUser({ email: usuario, password: senha }))
      .unwrap()
      .then(() => {
        navigate('/dashboard');
      })
      .catch(() => {
        console.error("Login falhou. Mensagem exibida no formulário.");
      });
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0fa2eb 0%, #fb3537 100%)',
        width: '100vw',
        margin: 0,
        padding: '20px',
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
      }}
    >
      <div
        className="p-4"
        style={{
          width: '100%',
          maxWidth: '1200px'
        }}
      >
        <div className="row g-0 shadow-lg rounded-4 overflow-hidden" style={{ 
          backgroundColor: 'white',
          backdropFilter: 'blur(10px)'
        }}>
          {/* Coluna da Esquerda - Branding/Imagens */}
          <div 
            className="col-md-6 d-none d-md-flex align-items-center justify-content-center p-5"
            style={{
              background: 'linear-gradient(135deg, rgba(15, 162, 235, 0.95) 0%, rgba(251, 53, 55, 0.85) 100%)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div className="text-center text-white position-relative z-1">
              {/* Logo Principal - fmdachatado.png */}
              <div className="mb-4 floating">
                <img 
                  src="/fmdachatato.png" 
                  alt="FMD Sistema" 
                  style={{
                    maxWidth: '220px',
                    height: 'auto',
                    filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.15))'
                  }}
                />
              </div>
              
              {/* Logo Secundário - pill.png */}
              <div className="mb-3">
                <img 
                  src="/pill.png" 
                  alt="Medicamentos" 
                  style={{
                    maxWidth: '70px',
                    height: 'auto',
                    opacity: 0.9,
                    filter: 'brightness(0) invert(1)'
                  }}
                />
              </div>
              
              <h3 className="fw-bold mb-3" style={{ fontSize: '1.5rem' }}>
                Sistema de Gestão Farmacêutica
              </h3>
              <p className="mb-0 opacity-90" style={{ fontSize: '0.95rem' }}>
                Controle completo de estoque e dispensação de medicamentos
              </p>
            </div>
            
            {/* Elementos decorativos de fundo */}
            <div 
              style={{
                position: 'absolute',
                top: '-50%',
                right: '-50%',
                width: '100%',
                height: '200%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                transform: 'rotate(45deg)',
                opacity: 0.2
              }}
            />
          </div>

          {/* Coluna da Direita - Formulário de Login */}
          <div className="col-md-6 p-5">
            <div className="d-flex flex-column justify-content-center h-100">
              {/* Header do Formulário */}
              <div className="text-center mb-4">
                <h2 className="fw-bold mb-2" style={{ color: '#0fa2eb', fontSize: '2rem' }}>
                  Bem-vindo
                </h2>
                <p className="text-muted" style={{ fontSize: '1rem' }}>
                  Entre com suas credenciais para acessar o sistema
                </p>
              </div>

              {/* Exibir mensagem de erro */}
              {error && (
                <Alert variant="danger" className="text-center border-0 rounded-3" style={{
                  background: 'rgba(251, 53, 55, 0.1)',
                  border: '1px solid rgba(251, 53, 55, 0.2)',
                  color: '#fb3537'
                }}>
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4" controlId="formUsuario">
                  <Form.Label className="fw-semibold text-dark mb-2" style={{ fontSize: '0.95rem' }}>
                    <i className="bi bi-person-fill me-2" style={{ color: '#0fa2eb' }}></i>
                    Usuário
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    required
                    placeholder="Digite seu email ou CPF"
                    autoFocus
                    className="py-3 px-3 rounded-3 border-1"
                    style={{
                      borderColor: '#e0e0e0',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="formSenha">
                  <Form.Label className="fw-semibold text-dark mb-2" style={{ fontSize: '0.95rem' }}>
                    <i className="bi bi-lock-fill me-2" style={{ color: '#0fa2eb' }}></i>
                    Senha
                  </Form.Label>
                  <Form.Control
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                    placeholder="Digite sua senha"
                    className="py-3 px-3 rounded-3 border-1"
                    style={{
                      borderColor: '#e0e0e0',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  disabled={loading === 'pending'}
                  className="w-100 py-3 rounded-3 fw-semibold border-0"
                  style={{
                    fontSize: '1.1rem',
                    background: 'linear-gradient(135deg, #0fa2eb 0%, #fb3537 100%)',
                    boxShadow: '0 4px 15px rgba(15, 162, 235, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (loading !== 'pending') {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(15, 162, 235, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (loading !== 'pending') {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(15, 162, 235, 0.3)';
                    }
                  }}
                >
                  {loading === 'pending' ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Entrando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right me-2"></i>
                      Entrar no Sistema
                    </>
                  )}
                </Button>
              </Form>

              {/* Footer do Formulário */}
              <div className="text-center mt-4 pt-3 border-top" style={{ borderColor: '#f0f0f0' }}>
                <small className="text-muted">
                  <i className="bi bi-shield-check me-1" style={{ color: '#0fa2eb' }}></i>
                  Sistema seguro e criptografado
                </small>
                <br />
                <small className="text-muted" style={{ fontSize: '0.85rem' }}>
                  Em caso de problemas, entre em contato com o suporte técnico
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos CSS adicionais */}
      <style>
        {`
          .form-control:focus {
            border-color: #0fa2eb !important;
            box-shadow: 0 0 0 0.2rem rgba(15, 162, 235, 0.15) !important;
          }
          
          .btn-primary:disabled {
            background: linear-gradient(135deg, #8fd4f5 0%, #fd9a9c 100%) !important;
            transform: none !important;
            box-shadow: none !important;
            opacity: 0.7;
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
          
          .floating {
            animation: float 4s ease-in-out infinite;
          }
          
          /* Melhorar a legibilidade do placeholder */
          .form-control::placeholder {
            color: #a0a0a0;
            opacity: 0.8;
          }
        `}
      </style>
    </div>
  );
}

export default Login;