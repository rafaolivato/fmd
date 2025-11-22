import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, Row, Col, Card, Button, Table, Spinner, Alert,
  Form, Badge
} from 'react-bootstrap';
import { FaPrint, FaFileExcel, FaCapsules, FaSync, FaFilter } from 'react-icons/fa';
import { useReactToPrint } from 'react-to-print';
import { relatorioService, type DispensacaoRelatorio } from '../../store/services/relatorioService';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const RelatorioDispensacoesPage: React.FC = () => {
  const [dispensacoes, setDispensacoes] = useState<DispensacaoRelatorio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para filtros
  const [dataInicio, setDataInicio] = useState<string>('');
  const [dataFim, setDataFim] = useState<string>('');
  const [filtroEstabelecimento, setFiltroEstabelecimento] = useState('');
  const [estabelecimentos, setEstabelecimentos] = useState<string[]>([]);
  
  const componentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Define datas padrão (últimos 30 dias)
  useEffect(() => {
    const fim = new Date();
    const inicio = new Date();
    inicio.setDate(inicio.getDate() - 30);
    
    setDataInicio(inicio.toISOString().split('T')[0]);
    setDataFim(fim.toISOString().split('T')[0]);
    
    loadEstabelecimentos();
  }, []);

  useEffect(() => {
    if (dataInicio && dataFim) {
      loadDispensacoes();
    }
  }, [dataInicio, dataFim, filtroEstabelecimento]);

  const loadDispensacoes = async () => {
    try {
      console.log('💊 Buscando dispensações...');
      setIsLoading(true);
      setError(null);
      
      const data = await relatorioService.getDispensacoes({
        dataInicio,
        dataFim,
        estabelecimento: filtroEstabelecimento || undefined
      });
      
      setDispensacoes(data);
      
    } catch (err: any) {
      console.error('💥 Erro:', err);
      setError(err.message || 'Erro ao carregar dispensações');
      setDispensacoes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEstabelecimentos = async () => {
    try {
      const data = await relatorioService.getEstabelecimentos();
      setEstabelecimentos(data);
    } catch (error) {
      console.error('Erro ao carregar estabelecimentos');
    }
  };

  // Cálculos totais
  const totalQuantidade = dispensacoes.reduce((sum, item) => sum + item.quantidade, 0);
  const totalValor = dispensacoes.reduce((sum, item) => sum + (item.quantidade * item.valorUnitario), 0);
  const pacientesUnicos = [...new Set(dispensacoes.map(item => item.pacienteId))].length;

  const handlePrint = () => {
    const printContent = componentRef.current;
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Dispensações ${dataInicio} a ${dataFim}</title>
              <style>
                @page { size: A4 landscape; margin: 10mm; }
                body { font-family: Arial, sans-serif; font-size: 12px; }
                .table { width: 100%; border-collapse: collapse; font-size: 10px; }
                th { background-color: #f8f9fa; font-weight: bold; padding: 8px; border: 1px solid #ddd; }
                td { padding: 6px; border: 1px solid #ddd; }
                .total-row { font-weight: bold; background-color: #e9ecef; }
                .no-print { display: none; }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // No RelatorioDispensacoesPage.tsx - ATUALIZE a função handleExportExcel:

const handleExportExcel = () => {
  try {
      // Define interface explícita para os dados do Excel
      interface ExcelRow {
          Data: string;
          Medicamento: string;
          Concentracao: string;
          'Forma Farmaceutica': string;
          Paciente: string;
          CPF: string;
          Estabelecimento: string;
          Profissional: string;
          Quantidade: number;
          'Valor Unitario': number;
          'Valor Total': number;
      }

      // Prepara os dados para Excel com tipo explícito
      const excelData: ExcelRow[] = dispensacoes.map(item => ({
          'Data': formatDate(item.dataDispensacao),
          'Medicamento': item.medicamento.principioAtivo,
          'Concentracao': item.medicamento.concentracao,
          'Forma Farmaceutica': item.medicamento.formaFarmaceutica,
          'Paciente': item.pacienteNome,
          'CPF': item.pacienteCpf || 'N/A',
          'Estabelecimento': item.estabelecimentoNome,
          'Profissional': item.profissionalNome,
          'Quantidade': item.quantidade,
          'Valor Unitario': item.valorUnitario,
          'Valor Total': item.quantidade * item.valorUnitario
      }));

      // Adiciona linha de totais
      const totalRow: ExcelRow = {
          'Data': '',
          'Medicamento': 'TOTAIS GERAIS',
          'Concentracao': '',
          'Forma Farmaceutica': '',
          'Paciente': '',
          'CPF': '',
          'Estabelecimento': '',
          'Profissional': '',
          'Quantidade': totalQuantidade,
          'Valor Unitario': 0,
          'Valor Total': totalValor
      };

      excelData.push(totalRow);

      // Cria worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      
      // Ajusta larguras das colunas
      const colWidths = [
          { wch: 12 }, // Data
          { wch: 25 }, // Medicamento
          { wch: 15 }, // Concentracao
          { wch: 20 }, // Forma Farmaceutica
          { wch: 20 }, // Paciente
          { wch: 15 }, // CPF
          { wch: 20 }, // Estabelecimento
          { wch: 20 }, // Profissional
          { wch: 12 }, // Quantidade
          { wch: 15 }, // Valor Unitario
          { wch: 15 }  // Valor Total
      ];
      worksheet['!cols'] = colWidths;

      // Cria workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Dispensações');

      // Gera nome do arquivo
      const fileName = `dispensacoes_${dataInicio}_a_${dataFim}.xlsx`;

      // Salva arquivo
      XLSX.writeFile(workbook, fileName);
      
      console.log('✅ Excel exportado com sucesso!');

  } catch (error) {
      console.error('❌ Erro ao exportar Excel:', error);
      alert('Erro ao exportar para Excel');
  }
};

  return (
    <Container fluid>
      {/* Cabeçalho */}
      <Row className="mb-4 no-print">
        <Col>
          <div className="d-flex align-items-center mt-3">
            <FaCapsules size={32} className="text-warning me-3" />
            <div>
              <h1 className="h2 mb-0">Relatório de Dispensações</h1>
              <p className="lead text-muted mb-0">Controle de medicamentos dispensados aos pacientes</p>
            </div>
          </div>
        </Col>
        <Col xs="auto" className="d-flex align-items-center gap-2">
          <Button 
            variant="outline-primary" 
            onClick={loadDispensacoes}
            disabled={isLoading}
          >
            <FaSync />
          </Button>
          <Button variant="outline-success" onClick={handlePrint}>
            <FaPrint className="me-2" />
            Imprimir
          </Button>
          <Button variant="outline-success" onClick={handleExportExcel}>
            <FaFileExcel className="me-2" />
            Excel
          </Button>
        </Col>
      </Row>

      {/* Filtros */}
      <Row className="mb-4 no-print">
        <Col>
          <Card>
            <Card.Header>
              <h6 className="mb-0">
                <FaFilter className="me-2" />
                Filtros
              </h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Data Início</Form.Label>
                    <Form.Control
                      type="date"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Data Fim</Form.Label>
                    <Form.Control
                      type="date"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Estabelecimento</Form.Label>
                    <Form.Select
                      value={filtroEstabelecimento}
                      onChange={(e) => setFiltroEstabelecimento(e.target.value)}
                    >
                      <option value="">Todos estabelecimentos</option>
                      {estabelecimentos.map(estab => (
                        <option key={estab} value={estab}>{estab}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2} className="d-flex align-items-end">
                  <Badge bg="info" className="fs-6">
                    {dispensacoes.length} registros
                  </Badge>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="no-print">
          {error}
        </Alert>
      )}

      {/* Relatório */}
      <div ref={componentRef}>
        <Card>
          <Card.Body>
            {/* Cabeçalho do Relatório */}
            <div className="text-center mb-4 print-header">
              <h2>Farmácia Municipal Digital - FMD</h2>
              <h4>Relatório de Dispensações</h4>
              <p className="text-muted">
                Período: {formatDate(dataInicio)} a {formatDate(dataFim)}
                {filtroEstabelecimento && ` | Estabelecimento: ${filtroEstabelecimento}`}
              </p>
              <p className="text-muted">
                Emitido em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
              </p>
            </div>

            {/* Tabela de Dispensações */}
            <div className="table-responsive">
              <Table striped bordered size="sm">
                <thead className="table-dark">
                  <tr>
                    <th>Data</th>
                    <th>Medicamento</th>
                    <th>Paciente</th>
                    <th>Estabelecimento</th>
                    <th>Profissional</th>
                    <th className="text-end">Quantidade</th>
                    <th className="text-end">Valor Unit.</th>
                    <th className="text-end">Valor Total</th>
                  </tr>
                </thead>
                <tbody>
                  {dispensacoes.map((dispensacao) => (
                    <tr key={dispensacao.id}>
                      <td>{formatDate(dispensacao.dataDispensacao)}</td>
                      <td>
                        <strong>{dispensacao.medicamento.principioAtivo}</strong>
                        <br />
                        <small className="text-muted">
                          {dispensacao.medicamento.concentracao} - {dispensacao.medicamento.formaFarmaceutica}
                        </small>
                      </td>
                      <td>
                        {dispensacao.pacienteNome}
                        <br />
                        <small className="text-muted">CPF: {dispensacao.pacienteCpf || 'N/A'}</small>
                      </td>
                      <td>{dispensacao.estabelecimentoNome}</td>
                      <td>{dispensacao.profissionalNome}</td>
                      <td className="text-end">{dispensacao.quantidade}</td>
                      <td className="text-end">{formatCurrency(dispensacao.valorUnitario)}</td>
                      <td className="text-end">
                        {formatCurrency(dispensacao.quantidade * dispensacao.valorUnitario)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="total-row">
                  <tr>
                    <td colSpan={5} className="text-end fw-bold">
                      TOTAIS GERAIS:
                    </td>
                    <td className="text-end fw-bold">{totalQuantidade}</td>
                    <td className="text-end fw-bold">-</td>
                    <td className="text-end fw-bold">
                      {formatCurrency(totalValor)}
                    </td>
                  </tr>
                </tfoot>
              </Table>
            </div>

            {/* Rodapé do Relatório */}
            <div className="mt-4 pt-3 border-top text-center">
              <small className="text-muted">
                Farmácia Municipal Digital - FMD 9.0 | 
                Sistema de Gestão Farmacêutica | 
                {dispensacoes.length} dispensações | 
                {pacientesUnicos} pacientes atendidos |
                Valor total: {formatCurrency(totalValor)}
              </small>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Resumo */}
      {!isLoading && dispensacoes.length > 0 && (
        <Row className="mt-3 no-print">
          <Col>
            <Card>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <h6>Resumo do Período</h6>
                    <p className="mb-1">
                      <strong>Total de dispensações:</strong> {dispensacoes.length}
                    </p>
                    <p className="mb-1">
                      <strong>Pacientes atendidos:</strong> {pacientesUnicos}
                    </p>
                    <p className="mb-1">
                      <strong>Total de unidades:</strong> {totalQuantidade}
                    </p>
                    <p className="mb-0">
                      <strong>Valor total dispensado:</strong> {formatCurrency(totalValor)}
                    </p>
                  </Col>
                  <Col md={6}>
                    <h6>Medicamentos Mais Dispensados</h6>
                    {/* Aqui pode adicionar um ranking depois */}
                    <div className="text-muted">
                      <small>Em breve: ranking dos medicamentos</small>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <style>
        {`
          @media print {
            .no-print { display: none !important; }
            .print-header { 
              border-bottom: 2px solid #333; 
              margin-bottom: 20px; 
              padding-bottom: 10px; 
            }
            .table { font-size: 10px; }
            .total-row { 
              font-weight: bold; 
              background-color: #f8f9fa !important; 
            }
          }
        `}
      </style>
    </Container>
  );
};

export default RelatorioDispensacoesPage;