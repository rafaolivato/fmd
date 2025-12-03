import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from "../../../store/services/api";
import { useToast } from '../../../contexts/ToastContext';
import './styles.css';

export function CadastroUsuario() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'farmaceutico',
    estabelecimentoId: ''
  });

  // Estado para lista de estabelecimentos (se precisar selecionar)
  const [estabelecimentos, setEstabelecimentos] = useState([]);

 // Na sua página CadastroUsuario.tsx, atualize o useEffect:

React.useEffect(() => {
  const loadEstabelecimentos = async () => {
    try {
      
      const response = await api.get('/estabelecimentos/select');
      
          
      setEstabelecimentos(response.data);
    } catch (error) {
      console.error('Erro ao carregar estabelecimentos:', error);
      addToast({
        type: 'error',
        title: 'Erro',
        description: 'Não foi possível carregar a lista de estabelecimentos'
      });
    }
  };
  loadEstabelecimentos();
}, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (formData.password !== formData.confirmPassword) {
      addToast({
        type: 'error',
        title: 'Erro',
        description: 'As senhas não coincidem'
      });
      return;
    }

    if (formData.password.length < 6) {
      addToast({
        type: 'error',
        title: 'Erro',
        description: 'A senha deve ter pelo menos 6 caracteres'
      });
      return;
    }

    setLoading(true);

    try {
      // Remove o campo de confirmação antes de enviar
      const { confirmPassword, ...dataToSend } = formData;
      
      const response = await api.post('/users', dataToSend);
      
      addToast({
        type: 'success',
        title: 'Sucesso!',
        description: `Usuário ${response.data.name} cadastrado com sucesso!`
      });

      // Limpa o formulário
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'farmaceutico',
        estabelecimentoId: ''
      });

      // Opcional: redireciona para lista de usuários
      // navigate('/admin/usuarios');

    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erro ao cadastrar usuário';
      addToast({
        type: 'error',
        title: 'Erro no cadastro',
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cadastro-usuario-container">
      <div className="cadastro-usuario-card">
        <header>
          <h1>Cadastrar Novo Usuário</h1>
          <p>Preencha os dados do novo usuário do sistema</p>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="input-group">
              <label htmlFor="name">Nome Completo *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Digite o nome completo"
              />
            </div>

            <div className="input-group">
              <label htmlFor="email">E-mail *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="usuario@exemplo.com"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label htmlFor="password">Senha *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Mínimo 6 caracteres"
                minLength={6}
              />
            </div>

            <div className="input-group">
              <label htmlFor="confirmPassword">Confirmar Senha *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Digite a senha novamente"
                minLength={6}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label htmlFor="role">Tipo de Usuário *</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="farmaceutico">Farmacêutico</option>
                <option value="almoxarife">Almoxarife</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="estabelecimentoId">Estabelecimento (Opcional)</label>
              <select
                id="estabelecimentoId"
                name="estabelecimentoId"
                value={formData.estabelecimentoId}
                onChange={handleChange}
              >
                <option value="">Selecione um estabelecimento</option>
                {estabelecimentos.map((estab: any) => (
                  <option key={estab.id} value={estab.id}>
                    {estab.nome} ({estab.tipo})
                  </option>
                ))}
              </select>
              <small className="helper-text">
                Deixe em branco se o usuário não tiver estabelecimento vinculado
              </small>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Cadastrando...' : 'Cadastrar Usuário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CadastroUsuario;