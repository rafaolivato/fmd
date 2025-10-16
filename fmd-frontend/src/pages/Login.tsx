import React, { useState} from 'react';
import type {FormEvent} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../store/slices/authSlice';
import type { AppDispatch, RootState } from '../store/store';
import { useNavigate } from 'react-router-dom';

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
    dispatch(loginUser({ usuario: usuario, senha: senha }))
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-md rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Acesso ao FMD</h2>

        {/* Exibir mensagem de erro */}
        {error && (
          <p className="p-2 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="usuario">
              Usuário (Email ou CPF)
            </label>
            <input
              type="text"
              id="usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="senha">
              Senha
            </label>
            <input
              type="password"
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={loading === 'pending'}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:opacity-50"
            >
              {loading === 'pending' ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;