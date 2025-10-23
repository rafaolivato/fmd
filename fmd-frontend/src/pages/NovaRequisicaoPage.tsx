import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import NovaRequisicaoForm from '../components/requisicoes/NovaRequisicaoForm';
import type { RequisicaoFormData } from '../types/Requisicao';
import type { Medicamento } from '../types/Medicamento';
import type { Estabelecimento } from '../types/Estabelecimento';
import { requisicaoService } from '../store/services/requisicaoService';
import { medicamentoService } from '../store/services/medicamentoService';
import { estabelecimentoService } from '../store/services/estabelecimentoService';

const NovaRequisicaoPage: React.FC = () => {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoadingData(true);
      const [medsData, estsData] = await Promise.all([
        medicamentoService.getAll(),
        estabelecimentoService.getAll()
      ]);
      setMedicamentos(medsData);
      setEstabelecimentos(estsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados necessários para requisição');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = async (formData: RequisicaoFormData) => {
    try {
      setIsLoading(true);
      const requisicao = await requisicaoService.create(formData);
      
      setSuccessMessage(`Requisição #${requisicao.id.substring(0, 8)} enviada com sucesso!`);
      
      setTimeout(() => {
        setSuccessMessage('');
        // Redirecionar para lista de requisições
        window.location.href = '/requisicoes';
      }, 3000);

    } catch (error: any) {
      console.error('Erro ao criar requisição:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao criar requisição';
      alert(`Erro: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Deseja cancelar a requisição? Os dados não salvos serão perdidos.')) {
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
      <Row className="mb-4">
        <Col>
          <h1>Nova Requisição</h1>
          <p className="lead">Solicite medicamentos de outros estabelecimentos</p>
        </Col>
      </Row>

      {successMessage && (
        <Row className="mb-4">
          <Col>
            <Alert variant="success">
              ✅ {successMessage}
            </Alert>
          </Col>
        </Row>
      )}

      <Row>
        <Col lg={10} xl={8}>
          <NovaRequisicaoForm
            estabelecimentos={estabelecimentos}
            medicamentos={medicamentos}
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