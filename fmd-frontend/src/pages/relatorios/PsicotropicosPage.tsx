import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Alert } from 'react-bootstrap';
import { FaBarcode, FaPrint, FaArrowLeft, FaBook, FaExclamationTriangle } from 'react-icons/fa';
import { api } from '../../store/services/api';

// --- TIPOS ---
interface MovimentoLivro {
  data: string;
  docNumero: string;
  tipo: string;
  origemDestino: string;
  prescritor: string;
  qtdEntrada: number;
  qtdSaida: number;
  qtdPerda: number;
  saldo: number;
}

interface PaginaLivro {
  medicamento: {
    id: number;
    principioAtivo: string;
    concentracao: string;
    formaFarmaceutica: string;
    tipoLista: string; // 'B1', 'A1', 'ANTIMICROBIANO'
  };
  movimentacoes: MovimentoLivro[];
}

interface FiltrosRelatorio {
  tipoLista: string;
  dataInicio: string;
  dataFim: string;
  medicamentoId?: number;
}

const RelatoriosPage: React.FC = () => {
  const [viewAtiva, setViewAtiva] = useState<'menu' | 'estoque' | 'livro_controlados'>('menu');
  const [filtros, setFiltros] = useState<FiltrosRelatorio>({
    tipoLista: 'B1',
    dataInicio: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`,
    dataFim: new Date().toISOString().split('T')[0]
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [dadosRelatorio, setDadosRelatorio] = useState<PaginaLivro[]>([]);
  const [medicamentos, setMedicamentos] = useState<any[]>([]);
  const [erro, setErro] = useState<string>('');

  // Buscar medicamentos disponíveis para o filtro
  useEffect(() => {
    carregarMedicamentos();
  }, [filtros.tipoLista]);

  const carregarMedicamentos = async () => {
    try {
      const response = await api.get('/medicamentos', {
        params: { tipoLista: filtros.tipoLista, ativo: true }
      });
      setMedicamentos(response.data);
    } catch (error) {
      console.error('Erro ao carregar medicamentos:', error);
    }
  };

  const handleGerarRelatorio = async () => {
    setIsLoading(true);
    setErro('');
    
    try {
      // Se não selecionou medicamento específico, busca todos do tipo de lista
      const params: any = {
        tipoLista: filtros.tipoLista,
        dataInicio: filtros.dataInicio,
        dataFim: filtros.dataFim
      };

      if (filtros.medicamentoId) {
        params.medicamentoId = filtros.medicamentoId;
      }

      const response = await api.get('/relatorios/livros-controlados', { params });
      
      if (response.data.length === 0) {
        setErro('Nenhum movimento encontrado para os filtros selecionados.');
      }
      
      setDadosRelatorio(response.data);
    } catch (error: any) {
      console.error('Erro ao buscar livro:', error);
      setErro(error.response?.data?.message || 'Erro ao gerar o livro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    if (dadosRelatorio.length === 0) {
      alert('Gere o relatório primeiro antes de imprimir.');
      return;
    }
    window.print();
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const getNomeLista = (tipo: string) => {
    const listas: { [key: string]: string } = {
      'B1': 'B1 (Psicotrópicos)',
      'A1': 'A1 (Entorpecentes)',
      'ANTIMICROBIANO': 'Antimicrobianos'
    };
    return listas[tipo] || tipo;
  };

  // --- MENU ---
  if (viewAtiva === 'menu') {
    return (
      <Container fluid className="p-4">
        <h2 className="mb-4 d-flex align-items-center text-primary">
          <FaBarcode className="me-2" /> Relatórios Gerenciais
        </h2>
        <Row className="g-4">
          <Col md={4} lg={3}>
            <Card 
              className="h-100 shadow-sm hover-card border-0 bg-white" 
              onClick={() => setViewAtiva('livro_controlados')} 
              style={{cursor: 'pointer'}}
            >
              <Card.Body className="text-center py-5">
                <div className="bg-danger bg-opacity-10 rounded-circle d-inline-flex p-4 mb-3">
                  <FaBook size={40} className="text-danger" />
                </div>
                <h5 className="card-title fw-bold text-dark">Livros Controlados (SNGPC)</h5>
                <p className="card-text text-muted small mt-2">
                  Antimicrobianos, Psicotrópicos e Entorpecentes.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  // --- TELA DO LIVRO ---
  return (
    <Container fluid className="p-4 bg-white" style={{ minHeight: '100vh' }}>
      {/* BARRA DE CONTROLE (Não Imprime) */}
      <div className="d-print-none mb-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Button variant="outline-secondary" onClick={() => setViewAtiva('menu')}>
            <FaArrowLeft size={16} className="me-2" /> Voltar
          </Button>
          <Button variant="primary" onClick={handlePrint} disabled={dadosRelatorio.length === 0}>
            <FaPrint size={16} className="me-2" /> Imprimir Livro
          </Button>
        </div>

        <Card className="bg-light border-0 mb-4">
          <Card.Body>
            <Row className="align-items-end">
              <Col md={3}>
                <Form.Label className="fw-bold">Tipo de Lista:</Form.Label>
                <Form.Select 
                  value={filtros.tipoLista} 
                  onChange={(e) => setFiltros({...filtros, tipoLista: e.target.value, medicamentoId: undefined})}
                >
                  <option value="B1">Lista B1 (Psicotrópicos)</option>
                  <option value="A1">Lista A1 (Entorpecentes)</option>
                  <option value="ANTIMICROBIANO">Antimicrobianos</option>
                </Form.Select>
              </Col>
              
              <Col md={3}>
                <Form.Label className="fw-bold">Medicamento (Opcional):</Form.Label>
                <Form.Select 
                  value={filtros.medicamentoId || ''} 
                  onChange={(e) => setFiltros({...filtros, medicamentoId: e.target.value ? parseInt(e.target.value) : undefined})}
                >
                  <option value="">Todos os medicamentos</option>
                  {medicamentos.map(med => (
                    <option key={med.id} value={med.id}>
                      {med.principioAtivo} - {med.concentracao}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col md={2}>
                <Form.Label className="fw-bold">Data Início:</Form.Label>
                <Form.Control 
                  type="date" 
                  value={filtros.dataInicio} 
                  onChange={(e) => setFiltros({...filtros, dataInicio: e.target.value})} 
                />
              </Col>

              <Col md={2}>
                <Form.Label className="fw-bold">Data Fim:</Form.Label>
                <Form.Control 
                  type="date" 
                  value={filtros.dataFim} 
                  onChange={(e) => setFiltros({...filtros, dataFim: e.target.value})} 
                />
              </Col>

              <Col md={2}>
                <Button 
                  variant="success" 
                  className="w-100" 
                  onClick={handleGerarRelatorio} 
                  disabled={isLoading}
                >
                  {isLoading ? 'Gerando...' : 'Gerar Relatório'}
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {erro && (
          <Alert variant="warning" className="d-print-none">
            <FaExclamationTriangle className="me-2" />
            {erro}
          </Alert>
        )}
      </div>

      {/* ÁREA DE IMPRESSÃO */}
      <div className="print-area">
        {dadosRelatorio.map((pagina, index) => (
          <div key={pagina.medicamento.id} className="page-break-after-always">
            {/* CABEÇALHO SNGPC */}
            <div className="border border-dark p-3 mb-3">
              <Row>
                <Col xs={8}>
                  <h4 className="fw-bold text-uppercase mb-1">LIVRO DE REGISTRO ESPECÍFICO</h4>
                  <h5 className="mb-0 text-muted">LISTA {getNomeLista(pagina.medicamento.tipoLista)} - PORTARIA 344/98</h5>
                </Col>
                <Col xs={4} className="text-end small">
                  <div><strong>FARMÁCIA MUNICIPAL</strong></div>
                  <div>Período: {formatarData(filtros.dataInicio)} à {formatarData(filtros.dataFim)}</div>
                  <div>Emissão: {new Date().toLocaleDateString()}</div>
                </Col>
              </Row>
            </div>

            {/* IDENTIFICAÇÃO DA SUBSTÂNCIA */}
            <div className="bg-light border border-dark border-bottom-0 p-2 fw-bold d-flex justify-content-between">
              <span>SUBSTÂNCIA: {pagina.medicamento.principioAtivo}</span>
              <span>APRESENTAÇÃO: {pagina.medicamento.concentracao} - {pagina.medicamento.formaFarmaceutica}</span>
            </div>

            {/* TABELA DE MOVIMENTAÇÃO */}
            <Table bordered size="sm" className="mb-0 table-bordered-dark fs-print-small">
              <thead className="text-center align-middle bg-white">
                <tr>
                  <th rowSpan={2} style={{width: '80px'}}>DATA</th>
                  <th colSpan={3}>HISTÓRICO</th>
                  <th colSpan={3}>MOVIMENTAÇÃO</th>
                  <th rowSpan={2} style={{width: '60px'}}>SALDO</th>
                </tr>
                <tr>
                  <th>DOC / NOTA</th>
                  <th>PROCEDÊNCIA / DESTINO</th>
                  <th>PRESCITOR (CRM)</th>
                  <th style={{width: '40px'}}>ENT.</th>
                  <th style={{width: '40px'}}>SAI.</th>
                  <th style={{width: '40px'}}>PER.</th>
                </tr>
              </thead>
              <tbody>
                {pagina.movimentacoes.map((mov, idx) => (
                  <tr key={idx}>
                    <td className="text-center">{formatarData(mov.data)}</td>
                    <td><strong>{mov.docNumero}</strong></td>
                    <td className="text-truncate" style={{maxWidth: '150px'}} title={mov.origemDestino}>
                      {mov.origemDestino}
                    </td>
                    <td className="text-truncate" style={{maxWidth: '150px'}} title={mov.prescritor}>
                      {mov.prescritor}
                    </td>
                    <td className="text-center text-success fw-bold">
                      {mov.qtdEntrada > 0 ? mov.qtdEntrada : '-'}
                    </td>
                    <td className="text-center text-danger fw-bold">
                      {mov.qtdSaida > 0 ? mov.qtdSaida : '-'}
                    </td>
                    <td className="text-center text-warning fw-bold">
                      {mov.qtdPerda > 0 ? mov.qtdPerda : '-'}
                    </td>
                    <td className="text-center bg-light fw-bold">{mov.saldo}</td>
                  </tr>
                ))}
                
                {/* Linhas vazias para preencher folha */}
                {[...Array(Math.max(0, 15 - pagina.movimentacoes.length))].map((_, i) => (
                  <tr key={`empty-${i}`} style={{height: '25px'}}>
                    <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* RODAPÉ E ASSINATURA */}
            <div className="border border-dark border-top-0 p-3 small text-muted d-flex justify-content-between mb-5">
              <span>Termo de Conferência</span>
              <span>Assinatura do Farmacêutico: __________________________________________</span>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media print {
          @page { 
            size: A4 landscape; 
            margin: 10mm; 
          }
          body * { 
            visibility: hidden; 
          }
          .print-area, .print-area * { 
            visibility: visible; 
          }
          .print-area { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
          }
          .table-bordered-dark th, 
          .table-bordered-dark td { 
            border: 1px solid #000 !important; 
          }
          .fs-print-small { 
            font-size: 10px; 
          }
          .page-break-after-always { 
            page-break-after: always; 
          }
          .d-print-none {
            display: none !important;
          }
        }
        
        @media screen {
          .hover-card:hover {
            transform: translateY(-2px);
            transition: transform 0.2s ease;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1) !important;
          }
        }
      `}</style>
    </Container>
  );
};

export default RelatoriosPage;