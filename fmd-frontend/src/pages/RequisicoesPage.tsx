import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Tabs, Tab, Alert } from 'react-bootstrap';
import RequisicoesList from '../components/requisicoes/RequisicoesList';
import RequisicaoDetailsModal from '../components/requisicoes/RequisicaoDetailsModal';
import AtenderRequisicaoModal from '../components/requisicoes/AtenderRequisicaoModal';
import type { Requisicao } from '../types/Requisicao';
import { requisicaoService } from '../store/services/requisicaoService';
import { FaPlus, FaSync, FaStore, FaHandshake } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Badge from 'react-bootstrap/Badge';

const RequisicoesPage: React.FC = () => {
  const [minhasRequisicoes, setMinhasRequisicoes] = useState<Requisicao[]>([]);
  const [paraAtender, setParaAtender] = useState<Requisicao[]>([]);
  const [selectedRequisicao, setSelectedRequisicao] = useState<Requisicao | null>(null);
  const [requisicaoParaAtender, setRequisicaoParaAtender] = useState<Requisicao | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAtenderModal, setShowAtenderModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('minhas');
  const navigate = useNavigate();

  // Mock - depois você pega do contexto de autenticação
  const estabelecimentoLogadoId = 'seu-estabelecimento-id-aqui';

  useEffect(() => {
    loadRequisicoes();
  }, []);

  const loadRequisicoes = async () => {
    try {
      setIsLoading(true);
      const [minhasData, paraAtenderData] = await Promise.all([
        requisicaoService.getMinhasRequisicoes(estabelecimentoLogadoId),
        requisicaoService.getParaAtender(estabelecimentoLogadoId)
      ]);
      setMinhasRequisicoes(minhasData);
      setParaAtender(paraAtenderData);
    } catch (error) {
      console.error('Erro ao carregar requisições:', error);
      alert('Erro ao carregar requisições');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (requisicao: Requisicao) => {
    setSelectedRequisicao(requisicao);
    setShowDetailsModal(true);
  };

  const handleAtender = (requisicao: Requisicao) => {
    setRequisicaoParaAtender(requisicao);
    setShowAtenderModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedRequisicao(null);
  };

  const handleCloseAtender = () => {
    setShowAtenderModal(false);
    setRequisicaoParaAtender(null);
  };

  const handleAtendimentoSuccess = () => {
    handleCloseAtender();
    loadRequisicoes(); // Recarrega a lista
  };

  const handleRefresh = () => {
    loadRequisicoes();
  };

  const handleNewRequisicao = () => {
    navigate('/requisicoes/nova');
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h1>Requisições</h1>
          <p className="lead">Gerencie requisições entre estabelecimentos</p>
        </Col>
        <Col xs="auto" className="d-flex align-items-center gap-2">
          <Button variant="primary" onClick={handleNewRequisicao}>
            <FaPlus className="me-2" />
            Nova Requisição
          </Button>
          <Button variant="outline-primary" onClick={handleRefresh}>
            <FaSync />
          </Button>
        </Col>
      </Row>

      <Row>
        <Col>
          <Tabs
            activeKey={activeTab}
            onSelect={(tab) => setActiveTab(tab || 'minhas')}
            className="mb-4"
          >
            <Tab 
              eventKey="minhas" 
              title={
                <span>
                  <FaStore className="me-2" />
                  Minhas Requisições
                  {minhasRequisicoes.length > 0 && (
                    <Badge bg="secondary" className="ms-2">
                      {minhasRequisicoes.length}
                    </Badge>
                  )}
                </span>
              }
            >
              <RequisicoesList
                requisicoes={minhasRequisicoes}
                onViewDetails={handleViewDetails}
                isLoading={isLoading}
                modo="minhas"
              />
            </Tab>
            
            <Tab 
              eventKey="para-atender" 
              title={
                <span>
                  <FaHandshake className="me-2" />
                  Para Atender
                  {paraAtender.length > 0 && (
                    <Badge bg="warning" className="ms-2">
                      {paraAtender.length}
                    </Badge>
                  )}
                </span>
              }
            >
              {paraAtender.filter(r => r.status === 'PENDENTE').length > 0 && (
                <Alert variant="warning" className="mb-3">
                  <FaHandshake className="me-2" />
                  Você tem {paraAtender.filter(r => r.status === 'PENDENTE').length} requisição(ões) pendente(s) para atender
                </Alert>
              )}
              <RequisicoesList
                requisicoes={paraAtender}
                onViewDetails={handleViewDetails}
                onAtender={handleAtender}
                isLoading={isLoading}
                modo="para-atender"
              />
            </Tab>
          </Tabs>
        </Col>
      </Row>

      {/* Modal de Detalhes */}
      {selectedRequisicao && (
        <RequisicaoDetailsModal
          requisicao={selectedRequisicao}
          show={showDetailsModal}
          onHide={handleCloseDetails}
        />
      )}

      {/* Modal de Atendimento */}
      {requisicaoParaAtender && (
        <AtenderRequisicaoModal
          requisicao={requisicaoParaAtender}
          show={showAtenderModal}
          onHide={handleCloseAtender}
          onSuccess={handleAtendimentoSuccess}
        />
      )}
    </Container>
  );
};

export default RequisicoesPage;