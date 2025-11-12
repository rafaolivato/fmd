// src/pages/MovimentosPage.tsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import MovimentosList from '../components/movimentos/MovimentosList';
import type { Movimento } from '../types/Movimento';
import { movimentoService } from '../store/services/movimentoService';
import { FaSync, FaExchangeAlt } from 'react-icons/fa';

const MovimentosPage: React.FC = () => {
  const [movimentos, setMovimentos] = useState<Movimento[]>([]);
  const [filteredMovimentos, setFilteredMovimentos] = useState<Movimento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');

  useEffect(() => {
    loadMovimentos();
  }, []);

  useEffect(() => {
    filterMovimentos();
  }, [movimentos, filtroTipo]);

  const loadMovimentos = async () => {
    try {
      setIsLoading(true);
      const data = await movimentoService.getAll();
      setMovimentos(data);
    } catch (error) {
      console.error('Erro ao carregar movimentos:', error);
      alert('Erro ao carregar movimentos');
    } finally {
      setIsLoading(false);
    }
  };

  const filterMovimentos = () => {
    if (filtroTipo === 'TODOS') {
      setFilteredMovimentos(movimentos);
    } else {
      setFilteredMovimentos(
        movimentos.filter(m => m.tipoMovimentacao === filtroTipo)
      );
    }
  };

  const handleViewDetails = (movimento: Movimento) => {
    // Aqui você pode abrir um modal ou navegar para página de detalhes
    console.log('Ver detalhes do movimento:', movimento);
    alert(`Detalhes do movimento ${movimento.numeroDocumento}\n\nEm desenvolvimento...`);
  };

  const handleRefresh = () => {
    loadMovimentos();
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center mt-3">
            <FaExchangeAlt size={32} className="text-primary me-3" />
            <div>
              <h1 className="h2 mb-0">Movimentações</h1>
              <p className="lead text-muted mb-0">Histórico de entradas e saídas do estoque</p>
            </div>
          </div>
        </Col>
        <Col xs="auto" className="d-flex align-items-center gap-2">
          <Form.Select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="TODOS">Todos os tipos</option>
            <option value="ENTRADA">Entradas</option>
            <option value="SAIDA">Saídas</option>
            <option value="DISPENSACAO">Dispensações</option>
          </Form.Select>
          <Button variant="outline-primary" onClick={handleRefresh}>
            <FaSync />
          </Button>
        </Col>
      </Row>

      <Row>
        <Col>
          <MovimentosList
            movimentos={filteredMovimentos}
            onViewDetails={handleViewDetails}
            isLoading={isLoading}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default MovimentosPage;