// src/pages/DispensacoesPage.tsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import DispensacoesList from '../components/dispensacao/DispensacoesList';
import DispensacaoDetailsModal from '../components/dispensacao/DispensacaoDetailsModal';
import type { Dispensacao } from '../types/Dispensacao';
import { dispensacaoService } from '../store/services/dispensacaoService';
import { FaSync, FaPlus, FaUserMd } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const DispensacoesPage: React.FC = () => {
  const [dispensacoes, setDispensacoes] = useState<Dispensacao[]>([]);
  const [filteredDispensacoes, setFilteredDispensacoes] = useState<Dispensacao[]>([]);
  const [selectedDispensacao, setSelectedDispensacao] = useState<Dispensacao | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadDispensacoes();
  }, []);

  useEffect(() => {
    filterDispensacoes();
  }, [dispensacoes, searchTerm]);

  const loadDispensacoes = async () => {
    try {
      setIsLoading(true);
      const data = await dispensacaoService.getAll();
      setDispensacoes(data);
    } catch (error) {
      console.error('Erro ao carregar dispensações:', error);
      alert('Erro ao carregar dispensações');
    } finally {
      setIsLoading(false);
    }
  };

  const filterDispensacoes = () => {
    if (!searchTerm.trim()) {
      setFilteredDispensacoes(dispensacoes);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredDispensacoes(
        dispensacoes.filter(disp =>
          disp.pacienteNome.toLowerCase().includes(term) ||
          disp.documentoReferencia.toLowerCase().includes(term) ||
          (disp.pacienteCpf && disp.pacienteCpf.includes(term)) ||
          disp.estabelecimentoOrigem.nome.toLowerCase().includes(term)
        )
      );
    }
  };

  const handleViewDetails = (dispensacao: Dispensacao) => {
    setSelectedDispensacao(dispensacao);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedDispensacao(null);
  };

  const handleRefresh = () => {
    loadDispensacoes();
  };

  const handleNewDispensacao = () => {
    navigate('/dispensacao');
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center mt-3">
            <FaUserMd size={32} className="text-primary me-3" />
            <div>
              <h1 className="h2 mb-0">Dispensações</h1>
              <p className="lead text-muted mb-0">Histórico de dispensações de medicamentos</p>
            </div>
          </div>
        </Col>
        <Col xs="auto" className="d-flex align-items-center gap-2">
          <Form.Control
            type="text"
            placeholder="Buscar por paciente, documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '300px' }}
          />
          <Button variant="primary" onClick={handleNewDispensacao}>
            <FaPlus className="me-2" />
            Nova Dispensação
          </Button>
          <Button variant="outline-primary" onClick={handleRefresh}>
            <FaSync />
          </Button>
        </Col>
      </Row>

      <Row>
        <Col>
          <DispensacoesList
            dispensacoes={filteredDispensacoes}
            onViewDetails={handleViewDetails}
            isLoading={isLoading}
          />
        </Col>
      </Row>

      {/* Modal de Detalhes */}
      {selectedDispensacao && (
        <DispensacaoDetailsModal
          dispensacao={selectedDispensacao}
          show={showDetailsModal}
          onHide={handleCloseDetails}
        />
      )}
    </Container>
  );
};

export default DispensacoesPage;