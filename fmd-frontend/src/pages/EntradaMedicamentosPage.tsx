import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaBoxOpen } from 'react-icons/fa';
import EntradaMedicamentosForm from '../components/movimentos/EntradaMedicamentosForm';
import type { MovimentoEntradaFormData } from '../types/MovimentoEntrada';
import type { Medicamento } from '../types/Medicamento';
import type { Estabelecimento } from '../types/Estabelecimento';
import type { Fornecedor } from '../types/Fornecedor'; 
import { movimentoEntradaService } from '../store/services/movimentoEntradaService';
import { medicamentoService } from '../store/services/medicamentoService';
import { estabelecimentoService } from '../store/services/estabelecimentoService';
import { authService } from '../store/services/authService';
import { fornecedorService } from '../store/services/fornecedorService';
import { useNavigate } from 'react-router-dom'; 

const EntradaMedicamentosPage: React.FC = () => {
  const navigate = useNavigate(); 
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]); 
  const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>([]);
  const [usuarioLogado, setUsuarioLogado] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoadingData(true);
      
      const userData = await authService.getCurrentUser();
      setUsuarioLogado(userData);
      
      const [medsData, fornecedoresData, estsData] = await Promise.all([
        medicamentoService.getAll(),
        fornecedorService.getAll(),
        estabelecimentoService.getAll()
      ]);
      
      setMedicamentos(medsData);
      setFornecedores(fornecedoresData);
      setEstabelecimentos(estsData);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar medicamentos e estabelecimentos');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = async (formData: MovimentoEntradaFormData) => {
    try {
      setIsLoading(true);
      
      // Validação de estabelecimento
      if (formData.estabelecimentoId !== usuarioLogado?.estabelecimentoId) {
        alert('Você só pode registrar entrada no seu próprio estabelecimento');
        return;
      }
      
      await movimentoEntradaService.create(formData);
      alert('Entrada de medicamentos registrada com sucesso!');
            
      navigate('/movimentacoes'); 
      
    } catch (error: any) {
      console.error('Erro ao registrar entrada:', error);
      
      let errorMessage = 'Erro ao registrar entrada';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    window.history.back();
  };

  if (isLoadingData) {
    return (
      <div className="container-fluid">
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-2">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (!usuarioLogado) {
    return (
      <div className="container-fluid">
        <div className="alert alert-danger">
          <h4>Erro de Autenticação</h4>
          <p>Usuário não autenticado. Faça login novamente.</p>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.href = '/login'}
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center mt-3">
            <FaBoxOpen size={32} className="text-primary me-3" />
            <div>
              <h1 className="h2 mb-0">Entrada de Medicamentos</h1>
            </div>
          </div>
        </Col>
      </Row>

      <div className="row">
        <div className="col-12">
          <EntradaMedicamentosForm
            estabelecimentos={estabelecimentos.filter(est => 
              est.id === usuarioLogado.estabelecimentoId 
            )}
            medicamentos={medicamentos}
            fornecedores={fornecedores} 
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </div>
      </div>
    </Container>
  );
}

export default EntradaMedicamentosPage;