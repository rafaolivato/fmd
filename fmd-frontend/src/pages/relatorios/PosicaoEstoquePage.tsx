import React, { useState, useEffect, useRef } from 'react';
import {
  Container, Row, Col, Card, Button, Table, Spinner, Alert,
  Form, Badge
} from 'react-bootstrap';
import { FaPrint, FaFileExcel, FaBox, FaSync } from 'react-icons/fa';
import { relatorioService, type ItemEstoqueRelatorio } from '../../store/services/relatorioService';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const PosicaoEstoquePage: React.FC = () => {
  const [itensEstoque, setItensEstoque] = useState<ItemEstoqueRelatorio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstabelecimento, setFiltroEstabelecimento] = useState('');
  const [estabelecimentos, setEstabelecimentos] = useState<string[]>([]);

  const componentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadEstoque();
    loadEstabelecimentos();
  }, []);

  useEffect(() => {
    if (filtroEstabelecimento !== undefined) {
      loadEstoque();
    }
  }, [filtroEstabelecimento]);

  const loadEstoque = async () => {
    try {
      console.log('🎯 Iniciando carga do estoque...');
      setIsLoading(true);
      setError(null);

      const data = await relatorioService.getPosicaoEstoque(filtroEstabelecimento);
      console.log('📦 Dados recebidos:', data);

      const dadosFiltrados = data.filter(item => item.quantidade > 0);

      console.log(`🎯 ${dadosFiltrados.length} itens após filtrar zeros (${data.length - dadosFiltrados.length} removidos)`);

      setItensEstoque(dadosFiltrados);

    } catch (err: any) {
      console.error('💥 Erro completo na carga:', err);

      const errorMessage = err.message || 'Erro ao carregar posição de estoque';
      setError(errorMessage);

      // Limpa a lista em caso de erro
      setItensEstoque([]);
    } finally {
      setIsLoading(false);
      console.log('🏁 Carga finalizada');
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
  const totalQuantidade = itensEstoque.reduce((sum, item) => sum + item.quantidade, 0);
  const totalValor = itensEstoque.reduce((sum, item) =>
    sum + (item.quantidade * item.valorUnitario), 0
  );

  const handleExportExcel = () => {
    try {
      // Define interface explícita para os dados do Excel
      interface ExcelRow {
        Medicamento: string;
        Concentracao: string;
        'Forma Farmaceutica': string;
        Lote: string;
        Validade: string;
        Localizacao: string;
        Estabelecimento: string;
        Quantidade: number;
        'Valor Unitario': number;
        'Valor Total': number;
      }

      // Prepara os dados para Excel com tipo explícito
      const excelData: ExcelRow[] = itensEstoque
        .filter(item => item.quantidade > 0)
        .map(item => ({
          'Medicamento': item.medicamento.principioAtivo,
          'Concentracao': item.medicamento.concentracao,
          'Forma Farmaceutica': item.medicamento.formaFarmaceutica,
          'Lote': item.numeroLote,
          'Validade': formatDate(item.dataValidade),
          'Localizacao': item.localizacao,
          'Estabelecimento': item.estabelecimento.nome,
          'Quantidade': item.quantidade,
          'Valor Unitario': item.valorUnitario,
          'Valor Total': item.quantidade * item.valorUnitario
        }));

      // Adiciona linha de totais - com tipo explícito
      const totalRow: ExcelRow = {
        'Medicamento': 'TOTAIS GERAIS',
        'Concentracao': '',
        'Forma Farmaceutica': '',
        'Lote': '',
        'Validade': '',
        'Localizacao': '',
        'Estabelecimento': '',
        'Quantidade': totalQuantidade,
        'Valor Unitario': 0, // ← Use 0 em vez de string vazia
        'Valor Total': totalValor
      };

      excelData.push(totalRow);

      // Cria worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Ajusta larguras das colunas
      const colWidths = [
        { wch: 25 }, // Medicamento
        { wch: 15 }, // Concentracao
        { wch: 20 }, // Forma Farmaceutica
        { wch: 12 }, // Lote
        { wch: 12 }, // Validade
        { wch: 15 }, // Localizacao
        { wch: 20 }, // Estabelecimento
        { wch: 12 }, // Quantidade
        { wch: 15 }, // Valor Unitario
        { wch: 15 }  // Valor Total
      ];
      worksheet['!cols'] = colWidths;

      // Cria workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Posição Estoque');

      // Gera nome do arquivo
      const fileName = `posicao_estoque_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Salva arquivo
      XLSX.writeFile(workbook, fileName);

      console.log('✅ Excel exportado com sucesso!');

    } catch (error) {
      console.error('❌ Erro ao exportar Excel:', error);
      alert('Erro ao exportar para Excel');
    }
  };

  const handlePrint = () => {
    // Cria conteúdo personalizado para impressão
    const printContent = `
        <div class="print-header">
            <h1>Farmácia Municipal Digital - FMD</h1>
            <p class="subtitle">Relatório de Posição de Estoque</p>
            <p class="print-info">
                Emitido em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
                ${filtroEstabelecimento ? ` | Estabelecimento: ${filtroEstabelecimento}` : ''}
            </p>
        </div>
        <div class="print-content">
            ${document.querySelector('.table-responsive')?.outerHTML}
        </div>
        <div class="print-footer">
            <p>Farmácia Municipal Digital - FMD 9.0 | Sistema de Gestão Farmacêutica</p>
            <p>${itensEstoque.length} itens listados | Valor total: ${formatCurrency(totalValor)}</p>
        </div>
    `;

    const printStyle = `
        <style>
            @media print {
                body { 
                    margin: 0; 
                    padding: 15mm;
                    font-family: Arial, sans-serif;
                    font-size: 12px;
                    color: #000;
                    background: white;
                }
                
                .print-header {
                    text-align: center;
                    border-bottom: 3px solid #2c5aa0;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                }
                
                .print-header h1 {
                    color: #2c5aa0;
                    font-size: 22px;
                    margin: 0 0 5px 0;
                    font-weight: bold;
                }
                
                .print-header .subtitle {
                    color: #666;
                    font-size: 16px;
                    margin: 0 0 10px 0;
                    font-weight: bold;
                }
                
                .print-header .print-info {
                    color: #888;
                    font-size: 12px;
                    margin: 0;
                }
                
                .print-content {
                    margin: 20px 0;
                }
                
                .print-footer {
                    border-top: 1px solid #ddd;
                    padding-top: 10px;
                    margin-top: 30px;
                    text-align: center;
                    font-size: 10px;
                    color: #666;
                }
                
                table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 10px;
                }
                
                th {
                    background-color: #2c5aa0 !important;
                    color: white !important;
                    font-weight: bold;
                    padding: 8px 4px;
                    border: 1px solid #ddd;
                }
                
                td {
                    padding: 6px 4px;
                    border: 1px solid #ddd;
                    vertical-align: top;
                }
                
                .total-row {
                    background-color: #f8f9fa !important;
                    font-weight: bold;
                }
                
                .total-row td {
                    border-top: 2px solid #333;
                }
            }
            
            @page {
                size: A4 landscape;
                margin: 15mm;
            }
        </style>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
            <html>
                <head>
                    <title>Posição de Estoque - FMD</title>
                    ${printStyle}
                </head>
                <body>
                    ${printContent}
                </body>
            </html>
        `);

      printWindow.document.close();
      printWindow.focus();

      // Aguarda o carregamento antes de imprimir
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          // Não fecha automaticamente - deixa usuário decidir
        }, 500);
      };
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

  if (isLoading) {
    return (
      <Container fluid>
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </Spinner>
          <p className="mt-2">Carregando posição de estoque...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid>
      {/* Cabeçalho */}
      <Row className="mb-4 no-print">
        <Col>
          <div className="d-flex align-items-center mt-3">
            <FaBox size={32} className="text-primary me-3" />
            <div>
              <h1 className="h2 mb-0">Posição de Estoque</h1>
              <p className="lead text-muted mb-0">
                Relatório completo de medicamentos em estoque
                {filtroEstabelecimento && (
                  <Badge bg="primary" className="ms-2">
                    {filtroEstabelecimento}
                  </Badge>
                )}
              </p>
            </div>
          </div>
        </Col>
        <Col xs="auto" className="d-flex align-items-center gap-2">
          <Form.Select
            value={filtroEstabelecimento}
            onChange={(e) => setFiltroEstabelecimento(e.target.value)}
            style={{ width: '200px' }}
          >
            <option value="">Todos estabelecimentos</option>
            {estabelecimentos.map((estab) => (
              <option key={estab} value={estab}>{estab}</option>
            ))}
          </Form.Select>

          <Button variant="outline-primary" onClick={loadEstoque}>
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

      {error && (
        <Alert variant="danger" className="no-print">
          {error}
        </Alert>
      )}

      {/* Relatório - Área de Impressão */}
      <div ref={componentRef}>
        <Card>
          <Card.Body>
            {/* Cabeçalho do Relatório */}
            <div className="text-center mb-4 print-header">
              <h2>Farmácia Municipal Digital - FMD</h2>
              <h4>Relatório de Posição de Estoque</h4>
              <p className="text-muted">
                Emitido em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
                {filtroEstabelecimento && ` | Estabelecimento: ${filtroEstabelecimento}`}
              </p>
            </div>

            {/* Tabela de Itens */}
            <div className="table-responsive">
              <Table striped bordered size="sm">
                <thead className="table-dark">
                  <tr>
                    <th>Medicamento</th>
                    <th>Lote</th>
                    <th>Validade</th>
                    <th>Localização</th>
                    <th>Estabelecimento</th>
                    <th className="text-end">Quantidade</th>
                    <th className="text-end">Valor Unit.</th>
                    <th className="text-end">Valor Total</th>
                  </tr>
                </thead>
                <tbody>
                  {itensEstoque.map((item) => (
                    <tr key={item.id} className="print-break">
                      <td>
                        <strong>{item.medicamento.principioAtivo}</strong>
                        <br />
                        <small className="text-muted">
                          {item.medicamento.concentracao} - {item.medicamento.formaFarmaceutica}
                        </small>
                      </td>
                      <td>{item.numeroLote}</td>
                      <td>{formatDate(item.dataValidade)}</td>
                      <td>{item.localizacao}</td>
                      <td>{item.estabelecimento.nome}</td>
                      <td className="text-end">{item.quantidade}</td>
                      <td className="text-end">{formatCurrency(item.valorUnitario)}</td>
                      <td className="text-end">
                        {formatCurrency(item.quantidade * item.valorUnitario)}
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
                {itensEstoque.length} itens listados |
                Página 1 de 1
              </small>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Resumo - apenas na tela */}
      {!isLoading && itensEstoque.length > 0 && (
        <Row className="mt-3 no-print">
          <Col>
            <Card>
              <Card.Body>
                <Row>
                  <Col md={4}>
                    <h6>Resumo do Estoque</h6>
                    <p className="mb-1">
                      <strong>Itens diferentes:</strong> {itensEstoque.length}
                    </p>
                    <p className="mb-1">
                      <strong>Total de unidades:</strong> {totalQuantidade}
                    </p>
                    <p className="mb-0">
                      <strong>Valor total em estoque:</strong> {formatCurrency(totalValor)}
                    </p>
                  </Col>
                  <Col md={8}>
                    <h6>Estoque por Validade</h6>
                    <div className="d-flex gap-3">
                      <Badge bg="success">Vencimento &gt; 1 ano: 45%</Badge>
                      <Badge bg="warning">Vencimento 3-12 meses: 35%</Badge>
                      <Badge bg="danger">Vencimento &lt; 3 meses: 20%</Badge>
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
            .table { font-size: 11px; }
            .total-row { 
              font-weight: bold; 
              background-color: #f8f9fa !important; 
            }
          }
          
          .hover-card:hover {
            transform: translateY(-2px);
            transition: transform 0.2s ease;
            cursor: pointer;
          }
        `}
      </style>
    </Container>
  );
};

export default PosicaoEstoquePage;