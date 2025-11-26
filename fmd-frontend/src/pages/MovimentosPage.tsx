import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Alert, Card } from 'react-bootstrap';
import MovimentosList from '../components/movimentos/MovimentosList';
import type { Movimento } from '../types/Movimento';
import { movimentoService } from '../store/services/movimentoService';
import { FaSync, FaExchangeAlt, FaExclamationTriangle, FaFilter } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useFornecedores } from '../hooks/useFornecedores'; // ✅ Import novo

const MovimentosPage: React.FC = () => {
  const [movimentos, setMovimentos] = useState<Movimento[]>([]);
  const [filteredMovimentos, setFilteredMovimentos] = useState<Movimento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
  const [filtroFornecedor, setFiltroFornecedor] = useState<string>('');
  const [filtroMedicamento, setFiltroMedicamento] = useState<string>('');
  const [fornecedoresOptions, setFornecedoresOptions] = useState<string[]>([]);
  const [medicamentosOptions, setMedicamentosOptions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // ✅ NOVO: Hook para carregar nomes dos fornecedores
  const { fornecedores, isLoading: isLoadingFornecedores } = useFornecedores(filteredMovimentos);

  useEffect(() => {
    loadMovimentos();
  }, []);

  useEffect(() => {
    filterMovimentos();
  }, [movimentos, filtroTipo, filtroFornecedor, filtroMedicamento, fornecedores]);

  // ✅ ATUALIZADO: Carrega opções quando movimentos ou fornecedores mudam
  useEffect(() => {
    if (movimentos.length > 0) {
      carregarOpcoesFiltro();
    }
  }, [movimentos, fornecedores]);

  const carregarOpcoesFiltro = () => {
    // ✅ CORREÇÃO: Usa nomes dos fornecedores em vez de IDs
    const fornecedoresUnicos = [...new Set(movimentos
      .filter(m => m.fornecedorId) // Filtra por fornecedorId
      .map(m => {
        // Se já temos o nome carregado, usa ele, senão usa o ID temporariamente
        return fornecedores[m.fornecedorId!] || m.fornecedorId!;
      })
    )].sort();

    // Extrai medicamentos únicos dos itens
    const medicamentosUnicos = [...new Set(movimentos
      .flatMap(m => m.itensMovimentados || [])
      .filter(item => item.medicamento?.principioAtivo)
      .map(item => item.medicamento.principioAtivo)
    )].sort();

    console.log('📊 Opções de filtro carregadas:', {
      fornecedores: fornecedoresUnicos,
      medicamentos: medicamentosUnicos
    });

    setFornecedoresOptions(fornecedoresUnicos);
    setMedicamentosOptions(medicamentosUnicos);
  };

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
    
    // Filtro por tipo
    if (filtroTipo !== 'TODOS') {
      filtered = filtered.filter(m => m.tipoMovimentacao === filtroTipo);
    }
    
    // ✅ CORREÇÃO: Filtro por nome do fornecedor
    if (filtroFornecedor) {
      filtered = filtered.filter(m => {
        if (!m.fornecedorId) return false;
        
        const nomeFornecedor = fornecedores[m.fornecedorId];
        if (nomeFornecedor && nomeFornecedor !== 'Fornecedor não encontrado') {
          return nomeFornecedor.toLowerCase().includes(filtroFornecedor.toLowerCase());
        }
        return m.fornecedorId.toLowerCase().includes(filtroFornecedor.toLowerCase());
      });
    }
    
    // Filtro por medicamento
    if (filtroMedicamento) {
      filtered = filtered.filter(m => 
        m.itensMovimentados?.some(item => 
          item.medicamento?.principioAtivo?.toLowerCase().includes(filtroMedicamento.toLowerCase())
        )
      );
    }
    
    console.log('🎯 Filtros aplicados:', {
      tipo: filtroTipo,
      fornecedor: filtroFornecedor,
      medicamento: filtroMedicamento,
      total: movimentos.length,
      filtrados: filtered.length
    });
    
    setFilteredMovimentos(filtered);
  };

  const handleViewDetails = (movimento: Movimento) => {
    console.log('📍 Navegando para detalhes do movimento:', movimento.id);
    
    if (!movimento.id) {
      console.error('❌ Movimento sem ID!');
      return;
    }
    
    navigate(`/movimentacoes/${movimento.id}`);
  };

  const handleRefresh = () => {
    console.log('🔄 Recarregando dados...');
    setFiltroFornecedor('');
    setFiltroMedicamento('');
    setFiltroTipo('TODOS');
    loadMovimentos();
  };

  const handleClearError = () => {
    setError(null);
  };

  const handleClearFilters = () => {
    setFiltroFornecedor('');
    setFiltroMedicamento('');
    setFiltroTipo('TODOS');
  };

  const hasActiveFilters = filtroTipo !== 'TODOS' || filtroFornecedor || filtroMedicamento;

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

      {/* Card de Filtros */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">
                <FaFilter className="me-2" />
                Filtros
              </h6>
              {hasActiveFilters && (
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={handleClearFilters}
                >
                  Limpar Filtros
                </Button>
              )}
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Tipo de Movimentação</Form.Label>
                    <Form.Select
                      value={filtroTipo}
                      onChange={(e) => setFiltroTipo(e.target.value)}
                    >
                      <option value="TODOS">Todos os tipos</option>
                      <option value="ENTRADA">Entradas</option>
                      <option value="SAIDA">Saídas</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                {/* ✅ CORREÇÃO: Adiciona filtro de fornecedor que estava faltando */}
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Fornecedor</Form.Label>
                    <Form.Select
                      value={filtroFornecedor}
                      onChange={(e) => setFiltroFornecedor(e.target.value)}
                    >
                      <option value="">Todos os fornecedores</option>
                      {fornecedoresOptions.map(fornecedor => (
                        <option key={fornecedor} value={fornecedor}>
                          {fornecedor}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Medicamento</Form.Label>
                    <Form.Select
                      value={filtroMedicamento}
                      onChange={(e) => setFiltroMedicamento(e.target.value)}
                    >
                      <option value="">Todos os medicamentos</option>
                      {medicamentosOptions.map(medicamento => (
                        <option key={medicamento} value={medicamento}>
                          {medicamento}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={3} className="d-flex align-items-end">
                  {hasActiveFilters && (
                    <div className="text-muted small">
                      {filteredMovimentos.length} resultado(s)
                    </div>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
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
        {`
          .spinning { 
            animation: spin 1s linear infinite; 
          } 
          @keyframes spin { 
            from { transform: rotate(0deg); } 
            to { transform: rotate(360deg); } 
          }
        `}
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