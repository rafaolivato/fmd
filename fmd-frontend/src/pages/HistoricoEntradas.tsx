import React, { useState, useEffect } from 'react';
import { useFornecedores } from '../hooks/useFornecedores';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Badge
} from 'react-bootstrap';
import {
  FaFilter,
  FaSync,
  FaSearch,
  FaFileAlt,
  FaBoxOpen
} from 'react-icons/fa';
import type { Movimento } from '../types/Movimento';
import { movimentoService } from '../store/services/movimentoService';
import { useNavigate } from 'react-router-dom';

const HistoricoEntradas: React.FC = () => {
  const [movimentos, setMovimentos] = useState<Movimento[]>([]);
  const [filteredMovimentos, setFilteredMovimentos] = useState<Movimento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para filtros
  const [filtroFornecedor, setFiltroFornecedor] = useState('');
  const [filtroMedicamento, setFiltroMedicamento] = useState('');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');

  const [fornecedoresOptions, setFornecedoresOptions] = useState<string[]>([]);
  const [medicamentosOptions, setMedicamentosOptions] = useState<string[]>([]);

  const { fornecedores, isLoading: isLoadingFornecedores } = useFornecedores(filteredMovimentos);

  const navigate = useNavigate();

  useEffect(() => {
    loadEntradas();
  }, []);

  useEffect(() => {
    filterEntradas();
  }, [movimentos, filtroFornecedor, filtroMedicamento, filtroDataInicio, filtroDataFim]);

  useEffect(() => {
  if (movimentos.length > 0 && Object.keys(fornecedores).length > 0) {
    carregarOpcoesFiltro(movimentos);
  }
}, [fornecedores, movimentos]);

  const loadEntradas = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔄 Carregando histórico de entradas...');
      const data = await movimentoService.getAll();

      // Filtra apenas entradas
      const entradas = Array.isArray(data)
        ? data.filter(m => m.tipoMovimentacao === 'ENTRADA')
        : [];

      console.log(`✅ ${entradas.length} entradas carregadas`);

      // ✅ DEBUG: Verifique a estrutura real dos dados
      if (entradas.length > 0) {
        console.log('📋 Estrutura do primeiro movimento:', entradas[0]);
        console.log('🔍 Campos do movimento:', Object.keys(entradas[0]));
        console.log('🏷️ FornecedorId do primeiro movimento:', entradas[0].fornecedorId);
      }

      setMovimentos(entradas);
      carregarOpcoesFiltro(entradas);

    } catch (error: any) {
      console.error('❌ Erro ao carregar entradas:', error);
      setError('Erro ao carregar histórico de entradas');
      setMovimentos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const carregarOpcoesFiltro = (entradas: Movimento[]) => {
    // Fornecedores únicos - ✅ CORREÇÃO: Agora usando os nomes dos fornecedores carregados
    const fornecedoresUnicos = [...new Set(entradas
      .filter(m => m.fornecedorId) // Filtra por fornecedorId
      .map(m => {
        // Se já temos o nome carregado, usa ele, senão usa o ID temporariamente
        return fornecedores[m.fornecedorId!] || m.fornecedorId!;
      })
    )].sort();

    // Medicamentos únicos
    const medicamentosUnicos = [...new Set(entradas
      .flatMap(m => m.itensMovimentados || [])
      .filter(item => item.medicamento?.principioAtivo)
      .map(item => item.medicamento.principioAtivo)
    )].sort();

    setFornecedoresOptions(fornecedoresUnicos);
    setMedicamentosOptions(medicamentosUnicos);
  };

  const filterEntradas = () => {
    let filtered = movimentos;

    // Filtro por fornecedor - ✅ CORREÇÃO: Agora filtra por ID
     if (filtroFornecedor) {
    filtered = filtered.filter(m => {
      if (!m.fornecedorId) return false;
      
      const nomeFornecedor = fornecedores[m.fornecedorId];
      // Se o nome já foi carregado, filtra por nome, senão por ID
      if (nomeFornecedor && nomeFornecedor !== 'Fornecedor não encontrado') {
        return nomeFornecedor.toLowerCase().includes(filtroFornecedor.toLowerCase());
      } else {
        // Fallback: filtra por ID enquanto o nome não carrega
        return m.fornecedorId.toLowerCase().includes(filtroFornecedor.toLowerCase());
      }
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

    // Filtro por data
    if (filtroDataInicio) {
      filtered = filtered.filter(m =>
        new Date(m.dataDocumento) >= new Date(filtroDataInicio)
      );
    }

    if (filtroDataFim) {
      const dataFim = new Date(filtroDataFim);
      dataFim.setHours(23, 59, 59, 999);
      filtered = filtered.filter(m =>
        new Date(m.dataDocumento) <= dataFim
      );
    }

    setFilteredMovimentos(filtered);
  };

  const handleViewDetails = (movimentoId: string) => {
    navigate(`/movimentacoes/${movimentoId}`);
  };

  const handleClearFilters = () => {
    setFiltroFornecedor('');
    setFiltroMedicamento('');
    setFiltroDataInicio('');
    setFiltroDataFim('');
  };

  const handleRefresh = () => {
    loadEntradas();
    handleClearFilters();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const correctedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
      return correctedDate.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  const getTotalItens = (movimento: Movimento) => {
    return movimento.itensMovimentados?.reduce((total, item) => total + (item.quantidade ?? 0), 0) || 0;
  };

  const getTotalValor = (movimento: Movimento) => {
    return movimento.itensMovimentados?.reduce((total, item) => {
      return total + ((item.valorUnitario ?? 0) * (item.quantidade ?? 0));
    }, 0) || 0;
  };

  const hasActiveFilters = filtroFornecedor || filtroMedicamento || filtroDataInicio || filtroDataFim;
  console.log('Movimentos carregados:', filteredMovimentos);

  return (
    <Container fluid>
      {/* Cabeçalho */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center mt-3">
            <FaBoxOpen size={32} className="text-success me-3" />
            <div>
              <h1 className="h2 mb-0">Histórico de Entradas</h1>
              <p className="lead text-muted mb-0">Controle completo das entradas no estoque</p>
            </div>
          </div>
        </Col>
        <Col xs="auto" className="d-flex align-items-center gap-2">
          <Button
            variant="outline-success"
            onClick={() => navigate('/entradas')}
          >
            Nova Entrada
          </Button>
          <Button
            variant="outline-primary"
            onClick={handleRefresh}
            disabled={isLoading}
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
                Filtros do Histórico
              </h6>
              {hasActiveFilters && (
                <div className="d-flex align-items-center gap-2">
                  <span className="text-muted small">
                    {filteredMovimentos.length} resultado(s)
                  </span>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={handleClearFilters}
                  >
                    Limpar Filtros
                  </Button>
                </div>
              )}
            </Card.Header>
            <Card.Body>
              <Row>
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

                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Data Início</Form.Label>
                    <Form.Control
                      type="date"
                      value={filtroDataInicio}
                      onChange={(e) => setFiltroDataInicio(e.target.value)}
                    />
                  </Form.Group>
                </Col>

                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Data Fim</Form.Label>
                    <Form.Control
                      type="date"
                      value={filtroDataFim}
                      onChange={(e) => setFiltroDataFim(e.target.value)}
                    />
                  </Form.Group>
                </Col>

                <Col md={2} className="d-flex align-items-end">
                  <Button
                    variant="primary"
                    onClick={filterEntradas}
                    className="w-100"
                  >
                    <FaSearch className="me-2" />
                    Filtrar
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Lista de Entradas */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h6 className="mb-0">
                <FaFileAlt className="me-2" />
                Entradas Registradas
                {hasActiveFilters && (
                  <Badge bg="primary" className="ms-2">
                    {filteredMovimentos.length}
                  </Badge>
                )}
              </h6>
            </Card.Header>
            <Card.Body>
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Carregando...</span>
                  </div>
                  <p className="mt-2">Carregando entradas...</p>
                </div>
              ) : filteredMovimentos.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <FaBoxOpen size={48} className="mb-3" />
                  <p>Nenhuma entrada encontrada</p>
                  {hasActiveFilters && (
                    <Button variant="outline-primary" onClick={handleClearFilters}>
                      Limpar filtros
                    </Button>
                  )}
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Documento</th>
                        <th>Fornecedor</th>
                        <th>Data Documento</th>
                        <th>Data Recebimento</th>
                        <th>Itens</th>
                        <th>Valor Total</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMovimentos.map((movimento) => (
                        <tr key={movimento.id}>
                          <td>
                            <strong>{movimento.numeroDocumento}</strong>
                            <br />
                            <small className="text-muted">{movimento.documentoTipo}</small>
                          </td>
                          <td>
                            {movimento.fornecedorId ? (
                              isLoadingFornecedores ? (
                                <span className="text-muted">
                                  <div className="spinner-border spinner-border-sm me-2" role="status">
                                    <span className="visually-hidden">Carregando...</span>
                                  </div>
                                  Carregando...
                                </span>
                              ) : (
                                fornecedores[movimento.fornecedorId] || 'Fornecedor não encontrado'
                              )
                            ) : (
                              'Fornecedor não informado'
                            )}
                          </td>
                          <td>{formatDate(movimento.dataDocumento)}</td>
                          <td>{formatDate(movimento.dataRecebimento)}</td>
                          <td>
                            <Badge bg="secondary">
                              {getTotalItens(movimento)} unidades
                            </Badge>
                          </td>
                          <td>
                            <strong>
                              {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                              }).format(getTotalValor(movimento))}
                            </strong>
                          </td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleViewDetails(movimento.id!)}
                            >
                              Detalhes
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style>
        {`
          .spinning { animation: spin 1s linear infinite; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}
      </style>
    </Container>
  );
};

export default HistoricoEntradas;