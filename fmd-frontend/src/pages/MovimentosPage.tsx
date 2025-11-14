import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Alert } from 'react-bootstrap';
import MovimentosList from '../components/movimentos/MovimentosList';
import type { Movimento } from '../types/Movimento';
import { movimentoService } from '../store/services/movimentoService';
import { FaSync, FaExchangeAlt, FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const MovimentosPage: React.FC = () => {
  const [movimentos, setMovimentos] = useState<Movimento[]>([]);
  const [filteredMovimentos, setFilteredMovimentos] = useState<Movimento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadMovimentos();
  }, []);

  useEffect(() => {
    filterMovimentos();
  }, [movimentos, filtroTipo]);

 // Atualize a função loadMovimentos no MovimentosPage.tsx
const loadMovimentos = async () => {
  try {
    console.log('🔄 Iniciando carregamento de movimentos...');
    setIsLoading(true);
    setError(null);
    
    const data = await movimentoService.getAll();
    console.log('✅ Dados carregados com sucesso:', data);
    
    setMovimentos(Array.isArray(data) ? data : []);
    
  } catch (error: any) {
    console.error('❌ Erro detalhado:', error);
    
    // Mensagem mais específica baseada no tipo de erro
    let errorMessage = 'Erro ao carregar movimentos';
    
    if (error.response?.status === 500) {
      errorMessage = 'Erro interno do servidor (500). Verifique os logs do backend.';
    } else if (error.message.includes('Network Error')) {
      errorMessage = 'Erro de conexão. Verifique se o servidor está rodando.';
    } else {
      errorMessage = error.message || 'Erro desconhecido';
    }
    
    setError(errorMessage);
    setMovimentos([]);
  } finally {
    setIsLoading(false);
  }
};

  const filterMovimentos = () => {
    let filtered = movimentos;
    
    if (filtroTipo !== 'TODOS') {
      filtered = movimentos.filter(m => m.tipoMovimentacao === filtroTipo);
    }
    
    console.log('🎯 Filtro aplicado:', {
      filtro: filtroTipo,
      total: movimentos.length,
      filtrados: filtered.length
    });
    
    setFilteredMovimentos(filtered);
  };

  const handleViewDetails = (movimento: Movimento) => {
  console.log('📍 Navegando para detalhes do movimento:', movimento.id);
  console.log('🔄 URL que será acessada:', `/movimentos/${movimento.id}`);
  
  // Verifique se o ID é válido
  if (!movimento.id) {
    console.error('❌ Movimento sem ID!');
    return;
  }
  
  navigate(`/movimentacoes/${movimento.id}`);
};

  const handleRefresh = () => {
    console.log('🔄 Recarregando dados...');
    loadMovimentos();
  };

  const handleClearError = () => {
    setError(null);
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
          </Form.Select>
          
          <Button 
            variant="outline-primary" 
            onClick={handleRefresh}
            disabled={isLoading}
            title="Recarregar dados"
          >
            <FaSync className={isLoading ? 'spinning' : ''} />
          </Button>
        </Col>
      </Row>

      {error && (
        <Row className="mb-3">
          <Col>
            <Alert variant="danger" dismissible onClose={handleClearError}>
              <FaExclamationTriangle className="me-2" />
              {error}
              <div className="mt-2">
                <small>Verifique: 
                  <br/>- Conexão com o servidor
                  <br/>- Serviço movimentoService.getAll()
                  <br/>- Console para mais detalhes
                </small>
              </div>
            </Alert>
          </Col>
        </Row>
      )}

      <style>
        {`.spinning { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}
      </style>

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