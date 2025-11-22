import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import DispensacaoForm from '../components/dispensacao/DispensacaoForm';
import type { DispensacaoFormData } from '../types/Dispensacao';
import type { Medicamento } from '../types/Medicamento';
import type { Estabelecimento } from '../types/Estabelecimento';
import type { Paciente } from '../types/Paciente';
import { dispensacaoService } from '../store/services/dispensacaoService';
import { medicamentoService } from '../store/services/medicamentoService';
import { estabelecimentoService } from '../store/services/estabelecimentoService';
import { pacienteService } from '../store/services/pacienteService';
import { authService } from '../store/services/authService';
import { profissionalSaudeService } from '../store/services/profissionalSaudeService';

const DispensacaoPage: React.FC = () => {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [profissionais, setProfissionais] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [usuarioLogado, setUsuarioLogado] = useState<any>(null);
  const [infoMessage, setInfoMessage] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoadingData(true);

      // 1. ✅ Carrega usuário logado primeiro
      const userData = await authService.getCurrentUser();
      setUsuarioLogado(userData);

      // ✅ VALIDAÇÃO: Verifica se userData existe
      if (!userData || !userData.estabelecimentoId) {
        throw new Error('Usuário não autenticado ou sem estabelecimento definido');
      }

      // 2. ✅ CARREGA DADOS (usando o método que JÁ EXISTE)
      const [medsData, estsData, pacsData, profsData] = await Promise.all([
        medicamentoService.getComEstoquePorEstabelecimento(userData.estabelecimentoId), 
        estabelecimentoService.getAll(),
        pacienteService.getAll(),
        profissionalSaudeService.getAll()
      ]);

      setMedicamentos(medsData);
      setPacientes(pacsData);
      setProfissionais(profsData);

      // 3. ✅ FILTRA ESTABELECIMENTOS (apenas o do usuário)
      const estabelecimentosFiltrados = estsData.filter(
        (est) => est.id === userData.estabelecimentoId
      );

      setEstabelecimentos(estabelecimentosFiltrados);

      // 4. ✅ FEEDBACK PARA O USUÁRIO
      if (medsData.length === 0) {
        setInfoMessage('Não há medicamentos disponíveis em estoque no momento.');
      } else {
        setInfoMessage(`Mostrando ${medsData.length} medicamento(s) disponível(eis) em estoque`);
      }

    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      alert(error.message || 'Erro ao carregar dados necessários para dispensação');
    } finally {
      setIsLoadingData(false);
    }
  };



  const handleSubmit = async (formData: DispensacaoFormData) => {
    try {
      setIsLoading(true);

      const dispensacao = await dispensacaoService.create(formData);

      setSuccessMessage(`Dispensação registrada com sucesso! Nº ${dispensacao.documentoReferencia}`);

      // Limpar formulário após sucesso
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);

      // Recarregar dados para atualizar estoque
      await loadData();

    } catch (error: any) {
      console.error('Erro ao registrar dispensação:', error);

      // Mensagem mais específica do erro
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao registrar dispensação';
      alert(`Erro: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Deseja cancelar a dispensação? Os dados não salvos serão perdidos.')) {
      window.history.back();
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
  return (
    <Container fluid>
      {/* Cabeçalho */}
      <Row className="mb-4">

      </Row>

      {successMessage && (
        <Row className="mb-4">
          <Col>
            <Alert variant="success" dismissible onClose={() => setSuccessMessage('')}>
              ✅ {successMessage}
            </Alert>
          </Col>
        </Row>
      )}

      {/* Formulário */}
      <Row className="justify-content-center">
        <Col xl={10} lg={12}>
          <DispensacaoForm
            estabelecimentos={estabelecimentos}
            medicamentos={medicamentos}
            pacientes={pacientes}
            profissionais={profissionais}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </Col>
      </Row>

      {/* Informações de Ajuda */}
      <Row className="mt-5">
        <Col lg={6} className="mb-3">
          <Alert variant="info">
            <h6 className="fw-bold">💡 Como usar:</h6>
            <ul className="mb-0 ps-3">
              <li>Informe os dados do paciente</li>
              <li>Adicione os medicamentos prescritos</li>
              <li>Documento de referência para psicotrópicos</li>
              <li>Finalize a dispensação</li>
            </ul>
          </Alert>
        </Col>
        <Col lg={6} className="mb-3">
          <Alert variant="light">
            <h6 className="fw-bold">📋 Estatísticas:</h6>
            <div className="row">
              <div className="col-6">
                <div className="text-center p-2">
                  <div className="h4 text-primary mb-1">{medicamentos.length}</div>
                  <small className="text-muted">Medicamentos</small>
                </div>
              </div>
              <div className="col-6">
                <div className="text-center p-2">
                  <div className="h4 text-success mb-1">{pacientes.length}</div>
                  <small className="text-muted">Pacientes</small>
                </div>
              </div>
            </div>
          </Alert>
        </Col>
      </Row>
    </Container>
  );
};

export default DispensacaoPage;