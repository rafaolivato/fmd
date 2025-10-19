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
  const [usuario, setUsuario] = useState(''); // Pode ser email ou CPF, dependendo do seu backend
  const [senha, setSenha] = useState('');

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { loading, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  // Redireciona imediatamente se já estiver autenticado
  if (isAuthenticated) {
    navigate('/dashboard');
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Dispara o thunk de login com as credenciais
    dispatch(loginUser({ email: usuario, password: senha }))
      .unwrap() // Desempacota o resultado para verificar sucesso/falha
      .then(() => {
        // Redireciona em caso de sucesso (o slice também lida com isso)
        navigate('/dashboard');
      })
      .catch(() => {
        // O erro já está no estado do Redux e será exibido
        console.error("Login falhou. Mensagem exibida no formulário.");
      });
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        width: '100vw',
        margin: 0,
        padding: 0
      }}
    >
      <div
        className="p-3"
        style={{
          width: '100%',
          maxWidth: '400px'
        }}
      >
        <Card className="shadow-lg p-4">
          <Card.Body>
            <h2 className="text-center mb-4">Acesso ao FMD</h2>

            {/* Exibir mensagem de erro com Alert do Bootstrap */}
            {error && (
              <Alert variant="danger" className="text-center">
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formUsuario">
                <Form.Label>Usuário (Email ou CPF)</Form.Label>
                <Form.Control
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  required
                  placeholder="Seu usuário"
                  autoFocus
                />
              </Form.Group>

              <Form.Group className="mb-4" controlId="formSenha">
                <Form.Label>Senha</Form.Label>
                <Form.Control
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  placeholder="Sua senha"
                />
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                disabled={loading === 'pending'}
                className="w-100"
              >
                {loading === 'pending' ? 'Entrando...' : 'Entrar'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}

export default Login;