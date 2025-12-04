import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from "../../../store/services/api";
import './styles.css';

export function CadastroUsuario() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'farmaceutico',
    estabelecimentoId: ''
  });

  const [estabelecimentos, setEstabelecimentos] = useState<any[]>([]);

  // Verifica se usuário atual é admin
  useEffect(() => {
    const checkAdmin = () => {
      try {
        const userStr = localStorage.getItem('@fmd:user');
        if (userStr) {
          const user = JSON.parse(userStr);
          const userIsAdmin = user?.role?.toLowerCase() === 'admin';
          setIsAdmin(userIsAdmin);

          if (!userIsAdmin) {
            setErrorMessage('Apenas administradores podem cadastrar novos usuários.');
          }
        }
      } catch (error) {
        console.error('Erro ao verificar permissões:', error);
      }
    };

    checkAdmin();
  }, []);

  // Carrega estabelecimentos
  useEffect(() => {
    const loadEstabelecimentos = async () => {
      try {
        let response;
        // Tenta a rota /select primeiro, se não funcionar, usa a padrão
        try {
          response = await api.get('/estabelecimentos/select');
        } catch {
          response = await api.get('/estabelecimentos');
        }

        setEstabelecimentos(response.data);
      } catch (error) {
        console.error('Erro ao carregar estabelecimentos:', error);
        setErrorMessage('Não foi possível carregar a lista de estabelecimentos');
      }
    };

    if (isAdmin) {
      loadEstabelecimentos();
    }
  }, [isAdmin]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpa mensagens de erro quando o usuário começa a digitar
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Limpa mensagens anteriores
    setSuccessMessage('');
    setErrorMessage('');

    // Validações básicas
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (!formData.name.trim()) {
      setErrorMessage('O nome é obrigatório');
      return;
    }

    if (!formData.email.trim()) {
      setErrorMessage('O email é obrigatório');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, estabelecimentoId, ...restData } = formData;

      // Prepara os dados para envio
      const dataToSend: any = { ...restData };

      // Só envia estabelecimentoId se não for string vazia
      if (estabelecimentoId && estabelecimentoId.trim() !== '') {
        dataToSend.estabelecimentoId = estabelecimentoId;
      }

      console.log('📤 Dados sendo enviados:', dataToSend);

      const response = await api.post('/users', dataToSend);
      console.log('📥 Resposta da API:', response.data);
      console.log('📥 Estabelecimento na resposta:', response.data.estabelecimentoId);
      console.log('📥 Dados completos do usuário criado:', response.data);


      // Mensagem de sucesso
      setSuccessMessage(`Usuário ${response.data.name} cadastrado com sucesso!`);

      // Mostra detalhes do usuário cadastrado no console
      console.log('✅ Usuário cadastrado:', response.data);

      // Limpa o formulário
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'farmaceutico',
        estabelecimentoId: ''
      });

      // Limpa mensagem após 5 segundos
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);

    } catch (error: any) {
      console.error('Erro ao cadastrar usuário:', error);

      let errorMsg = 'Erro ao cadastrar usuário';

      if (error.response?.status === 409) {
        errorMsg = 'Este e-mail já está cadastrado no sistema';
      } else if (error.response?.status === 403) {
        errorMsg = 'Acesso negado. Apenas administradores podem cadastrar usuários';
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }

      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Se não for admin, mostra mensagem
  if (!isAdmin) {
    return (
      <div className="cadastro-usuario-container">
        <div className="cadastro-usuario-card">
          <header>
            <h1>Cadastrar Novo Usuário</h1>
            <p>Acesso Restrito</p>
          </header>

          <div className="access-denied-message">
            <h5>❌ Acesso Negado</h5>
            <p>Apenas administradores podem cadastrar novos usuários.</p>
            <button
              className="btn-secondary"
              onClick={() => navigate('/dashboard')}
            >
              Voltar para Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cadastro-usuario-container">
      <div className="cadastro-usuario-card">
        <header>
          <h1>Cadastrar Novo Usuário</h1>
          <p>Preencha os dados do novo usuário do sistema</p>
        </header>

        {/* Mensagens de sucesso/erro */}
        {successMessage && (
          <div className="alert-success">
            <strong>✅ Sucesso!</strong> {successMessage}
            <button
              type="button"
              className="close-btn"
              onClick={() => setSuccessMessage('')}
              aria-label="Fechar"
            >
              ×
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="alert-error">
            <strong>❌ Erro!</strong> {errorMessage}
            <button
              type="button"
              className="close-btn"
              onClick={() => setErrorMessage('')}
              aria-label="Fechar"
            >
              ×
            </button>
          </div>
        )}

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
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Cadastrando...
                </>
              ) : (
                'Cadastrar Usuário'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CadastroUsuario;