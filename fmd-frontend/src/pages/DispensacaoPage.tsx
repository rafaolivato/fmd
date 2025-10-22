// src/pages/DispensacaoPage.tsx
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

const DispensacaoPage: React.FC = () => {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoadingData(true);
      const [medsData, estsData, pacsData] = await Promise.all([
        medicamentoService.getAll(),
        estabelecimentoService.getAll(),
        pacienteService.getAll()
      ]);
      setMedicamentos(medsData);
      setEstabelecimentos(estsData);
      setPacientes(pacsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados necessários para dispensação');
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
      <Row className="mb-4">
        <Col>
          <h1>Dispensação de Medicamentos</h1>
          <p className="lead">Registre a dispensação de medicamentos para pacientes</p>
        </Col>
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

      <Row>
        <Col>
          <DispensacaoForm
            estabelecimentos={estabelecimentos}
            medicamentos={medicamentos}
            pacientes={pacientes}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </Col>
      </Row>

      {/* Informações de Ajuda */}
      <Row className="mt-4">
        <Col md={6}>
          <Alert variant="info">
            <h6>💡 Como usar:</h6>
            <ul className="mb-0">
              <li>Selecione o estabelecimento (farmácia)</li>
              <li>Informe os dados do paciente</li>
              <li>Adicione os medicamentos prescritos</li>
              <li>Informe o documento de referência</li>
              <li>Finalize a dispensação</li>
            </ul>
          </Alert>
        </Col>
        <Col md={6}>
          <Alert variant="light">
            <h6>📋 Informações:</h6>
            <ul className="mb-0">
              <li><strong>Estabelecimentos:</strong> {estabelecimentos.length}</li>
              <li><strong>Medicamentos:</strong> {medicamentos.length}</li>
              <li><strong>Pacientes:</strong> {pacientes.length}</li>
            </ul>
          </Alert>
        </Col>
      </Row>
    </Container>
  );
};

export default DispensacaoPage;