import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../store/slices/authSlice';
import type { AppDispatch, RootState } from '../store/store';
import { useNavigate } from 'react-router-dom';
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
        console.error("Login falhou.");
      });
  };

  // Cores da marca em constantes para fácil manutenção
  const BRAND_BLUE = '#0fa2eb';
  const BRAND_RED = '#fb3537';

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{
        minHeight: '100vh',
        // Mudança 1: Fundo neutro e sóbrio (cinza corporativo) em vez de gradiente forte
        backgroundColor: '#f4f7f6',
        width: '100vw',
        margin: 0,
        padding: '20px',
        fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif'
      }}
    >
      <div
        className="shadow rounded-4 overflow-hidden"
        style={{
          width: '100%',
          maxWidth: '1000px', // Ligeiramente menor para ficar mais compacto/focado
          backgroundColor: '#fff',
          display: 'flex',
          flexWrap: 'wrap'
        }}
      >
        {/* Coluna da Esquerda - Branding Institucional */}
        {/* Agora usa o Azul sólido ou gradiente sutil de azul para azul-escuro (passa confiança) */}
        <div 
          className="col-md-5 d-none d-md-flex flex-column align-items-center justify-content-center p-5 text-white"
          style={{
            background: `linear-gradient(160deg, ${BRAND_BLUE} 0%, #097ab0 100%)`,
            position: 'relative'
          }}
        >
          <div className="text-center position-relative z-1">
            <div className="mb-4 bg-white rounded-circle p-3 d-inline-flex align-items-center justify-content-center shadow-sm" style={{ width: '120px', height: '120px' }}>
              <img 
                src="/fmdachatato.png" 
                alt="FMD Sistema" 
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                  // Removida a animação 'floating' para dar estabilidade
                }}
              />
            </div>
            
            <h3 className="fw-bold mb-2 mt-3">Gestão Farmacêutica</h3>
            <div style={{ width: '50px', height: '4px', background: BRAND_RED, margin: '15px auto', borderRadius: '2px' }}></div>
            <p className="opacity-75 small px-4">
              Acesso restrito a administradores e farmacêuticos autorizados.
            </p>
          </div>
        </div>

        {/* Coluna da Direita - Formulário Limpo */}
        <div className="col-12 col-md-7 p-5 bg-white">
          <div className="d-flex flex-column justify-content-center h-100 px-md-4">
            
            <div className="mb-4">
              <h4 className="fw-bold text-dark mb-1" style={{ fontSize: '1.75rem' }}>Login</h4>
              <p className="text-muted small">Insira suas credenciais de acesso.</p>
            </div>

            {error && (
              <Alert variant="danger" className="d-flex align-items-center text-sm py-2">
                <i className="bi bi-exclamation-circle-fill me-2"></i>
                <small>{error}</small>
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formUsuario">
                <Form.Label className="text-secondary small fw-bold text-uppercase" style={{ letterSpacing: '0.5px', fontSize: '0.75rem' }}>
                  Usuário / Email
                </Form.Label>
                <Form.Control
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  required
                  placeholder="ex: nome@farmacia.com"
                  className="form-control-lg bg-light border-0 fs-6"
                  style={{ minHeight: '50px' }}
                />
              </Form.Group>

              <Form.Group className="mb-4" controlId="formSenha">
                <Form.Label className="text-secondary small fw-bold text-uppercase" style={{ letterSpacing: '0.5px', fontSize: '0.75rem' }}>
                  Senha
                </Form.Label>
                <Form.Control
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="form-control-lg bg-light border-0 fs-6"
                  style={{ minHeight: '50px' }}
                />
              </Form.Group>

              <div className="d-grid gap-2">
                <Button
                  variant="primary"
                  type="submit"
                  disabled={loading === 'pending'}
                  className="py-3 fw-bold border-0"
                  style={{
                    backgroundColor: BRAND_BLUE,
                    boxShadow: `0 4px 12px rgba(15, 162, 235, 0.25)`,
                    fontSize: '0.95rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (loading !== 'pending') {
                       e.currentTarget.style.backgroundColor = '#0b8ac9'; // Azul um pouco mais escuro
                       e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (loading !== 'pending') {
                       e.currentTarget.style.backgroundColor = BRAND_BLUE;
                       e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {loading === 'pending' ? 'Autenticando...' : 'Acessar Sistema'}
                </Button>
              </div>
            </Form>

            <div className="mt-4 text-center">
              <small className="text-muted" style={{ fontSize: '0.8rem' }}>
                Esqueceu sua senha? <a href="#" style={{ color: BRAND_BLUE, textDecoration: 'none', fontWeight: 600 }}>Contate o suporte TI</a>
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Global para inputs ficarem mais elegantes */}
      <style>
        {`
          /* Foco mais sério: Borda Azul sólida, sem o brilho padrão do bootstrap */
          .form-control:focus {
            background-color: #fff !important;
            box-shadow: 0 0 0 2px rgba(15, 162, 235, 0.2) !important;
            color: #333;
          }
          
          /* Placeholder mais sutil */
          .form-control::placeholder {
            color: #adb5bd;
            font-size: 0.9rem;
          }
        `}
      </style>
    </div>
  );
}

export default Login;