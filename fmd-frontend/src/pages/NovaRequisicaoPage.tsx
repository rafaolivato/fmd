import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; // Adicione este import
import NovaRequisicaoForm from '../components/requisicoes/NovaRequisicaoForm';
import type { RequisicaoFormData } from '../types/Requisicao';
import type { Medicamento } from '../types/Medicamento';
import type { Estabelecimento } from '../types/Estabelecimento';
import { requisicaoService } from '../store/services/requisicaoService';
import { medicamentoService } from '../store/services/medicamentoService';
import { estabelecimentoService } from '../store/services/estabelecimentoService';
import { authService } from '../store/services/authService';

const NovaRequisicaoPage: React.FC = () => {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>([]);
  const [usuarioLogado, setUsuarioLogado] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [infoMessage, setInfoMessage] = useState<string>(''); // Estado para mensagem de sucesso

  const navigate = useNavigate(); // Hook para navegação

  useEffect(() => {
    loadData();
  }, []);

 // Na NovaRequisicaoPage.tsx - SOLUÇÃO FUNCIONAL
const loadData = async () => {
  try {
    setIsLoadingData(true);
    setError('');
    setInfoMessage('');
    
    const userData = await authService.getCurrentUser();
    if (!userData) {
      setError('Usuário não autenticado. Faça login novamente.');
      return;
    }
    
    setUsuarioLogado({
      id: userData.id,
      estabelecimentoId: userData.estabelecimentoId,
      estabelecimentoNome: userData.estabelecimento?.nome || 'Meu Estabelecimento'
    });
    
 // ✅ CORREÇÃO AQUI: Use getComEstoque() em vez de getAll()
    const [medsData, estsData] = await Promise.all([
      medicamentoService.getComEstoque(), // ✅ MUDANÇA CRÍTICA
      estabelecimentoService.getAll()
    ]);
    
    console.log('✅ Medicamentos com estoque:', medsData);
    console.log('📈 Resultado:', medsData.length, 'medicamentos disponíveis');
    
    setMedicamentos(medsData);
    setEstabelecimentos(estsData);

    if (medsData.length === 0) {
      setInfoMessage('Não há medicamentos disponíveis em estoque no momento.');
    } else {
      setInfoMessage(`Mostrando ${medsData.length} medicamento(s) disponível(eis) em estoque`);
    }

  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    setError('Erro ao carregar dados necessários para requisição');
  } finally {
    setIsLoadingData(false);
  }
};


  const handleSubmit = async (formData: RequisicaoFormData) => {
    try {
      setIsLoading(true);
      const requisicao = await requisicaoService.create(formData);

      // Mostra mensagem de sucesso
      setSuccessMessage(`Requisição #${requisicao.id.substring(0, 8)} criada com sucesso!`);

      // Limpa o formulário após 2 segundos e redireciona
      setTimeout(() => {
        setSuccessMessage('');
        // Redireciona para a lista de requisições SEM deslogar
        navigate('/requisicoes'); // Use navigate em vez de window.location
      }, 2000);

    } catch (error: any) {
      console.error('Erro ao criar requisição:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao criar requisição';

      // Se for erro 401 (não autorizado), redireciona para login
      if (error.response?.status === 401) {
        authService.logout();
      } else {
        alert(`Erro: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Deseja cancelar a requisição? Os dados não salvos serão perdidos.')) {
      navigate('/requisicoes'); // Use navigate em vez de window.history.back()
    }
  };

  if (isLoadingData) {
    return (
      <Container fluid>
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-2">Carregando dados...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid>
        <Alert variant="danger">
          {error}
        </Alert>
        <div className="text-center">
          <button
            className="btn btn-primary"
            onClick={() => navigate('/login')}
          >
            Fazer Login
          </button>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid>
      <div className="row mb-4">

      </div>

      {/* Mensagem de sucesso */}
      {successMessage && (
        <Row className="mb-4">
          <Col>
            <Alert variant="success">
              ✅ {successMessage}
              <br />
              <small>Redirecionando para a lista de requisições...</small>
            </Alert>
          </Col>
        </Row>
      )}

      {infoMessage && (
        <Row className="mb-4">
          <Col>
            <Alert variant="info">
              ℹ️ {infoMessage}
            </Alert>
          </Col>
        </Row>
      )}

      <Row>
        <Col lg={10} xl={8}>
          <NovaRequisicaoForm
            estabelecimentos={estabelecimentos}
            medicamentos={medicamentos}
            usuarioLogado={usuarioLogado}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default NovaRequisicaoPage;