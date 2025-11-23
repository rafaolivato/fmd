import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Form } from 'react-bootstrap';
import { FaBarcode, FaPrint, FaArrowLeft, FaBook } from 'react-icons/fa';
import { api } from '../../store/services/api';


// --- TIPOS ---
interface MovimentoLivro {
  data: string;
  docNumero: string;
  tipo: string;
  origemDestino: string; // Fornecedor ou Paciente
  prescritor: string;    // Médico (apenas saídas)
  qtdEntrada: number;
  qtdSaida: number;
  qtdPerda: number;
  saldo: number;
}

interface PaginaLivro {
  medicamento: {
    principioAtivo: string;
    concentracao: string;
    formaFarmaceutica: string;
  };
  movimentacoes: MovimentoLivro[];
}

const RelatoriosPage: React.FC = () => {
  const [viewAtiva, setViewAtiva] = useState<'menu' | 'estoque' | 'livro_controlados'>('menu');
  const [tipoLista, setTipoLista] = useState('B1');
  const [periodo, setPeriodo] = useState('2025-11');
  const [isLoading, setIsLoading] = useState(false);

  // MOCK: Dados que viriam do backend (LivrosControladosController)
  // O backend retornará um array de "Páginas", uma para cada medicamento
  const [dadosRelatorio, setDadosRelatorio] = useState<PaginaLivro[]>([
    {
      medicamento: { principioAtivo: 'DIAZEPAM', concentracao: '10MG', formaFarmaceutica: 'COMPRIMIDO' },
      movimentacoes: [
        {
          data: '2025-11-01', tipo: 'ENTRADA', docNumero: 'NF 554', origemDestino: 'MEDICAMENTOS BRASIL LTDA', prescritor: '-',
          qtdEntrada: 500, qtdSaida: 0, qtdPerda: 0, saldo: 500
        },
        {
          data: '2025-11-03', tipo: 'SAIDA', docNumero: 'Rec: 1020', origemDestino: 'JOÃO DA SILVA', prescritor: 'CRM 12345 - DR. HOUSE',
          qtdEntrada: 0, qtdSaida: 30, qtdPerda: 0, saldo: 470
        },
        {
          data: '2025-11-05', tipo: 'PERDA', docNumero: 'AVARIA', origemDestino: 'INTERNO', prescritor: '-',
          qtdEntrada: 0, qtdSaida: 0, qtdPerda: 10, saldo: 460
        }
      ]
    }
  ]);

  const handlePrint = () => {
    window.print();
  };

  // Dentro de RelatoriosPage.tsx
const handleGerarRelatorio = async () => {
    setIsLoading(true);
    try {
      // Formata as datas para o padrão esperado pelo backend (YYYY-MM-DD)
      const [ano, mes] = periodo.split('-'); // periodo vem do input type="month" (ex: "2025-11")
      
      // Cria data inicial e final do mês
      const dataInicio = `${ano}-${mes}-01`;
      const ultimoDia = new Date(parseInt(ano), parseInt(mes), 0).getDate();
      const dataFim = `${ano}-${mes}-${ultimoDia}`;
  
      // Chama a rota que acabamos de criar
      const response = await api.get('/relatorios/livros-controlados', {
        params: {
          tipoLista: tipoLista, // 'B1', 'A1', etc
          dataInicio,
          dataFim
        }
      });
  
      setDadosRelatorio(response.data);
    } catch (error) {
      console.error("Erro ao buscar livro:", error);
      alert("Erro ao gerar o livro. Verifique o console.");
    } finally {
      setIsLoading(false);
    }
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
            <Card className="h-100 shadow-sm hover-card border-0 bg-white" onClick={() => setViewAtiva('livro_controlados')} style={{cursor: 'pointer'}}>
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
                <Button variant="primary" onClick={handlePrint}>
                    <FaPrint size={16} className="me-2" /> Imprimir Livro
                </Button>
            </div>

            <Card className="bg-light border-0 mb-4">
                <Card.Body>
                    <Row className="align-items-end">
                        <Col md={3}>
                            <Form.Label className="fw-bold">Tipo de Lista:</Form.Label>
                            <Form.Select value={tipoLista} onChange={(e) => setTipoLista(e.target.value)}>
                                <option value="B1">Lista B1 (Psicotrópicos)</option>
                                <option value="A1">Lista A1 (Entorpecentes)</option>
                                <option value="ANTIMICROBIANO">Antimicrobianos</option>
                            </Form.Select>
                        </Col>
                        <Col md={3}>
                            <Form.Label className="fw-bold">Período:</Form.Label>
                            <Form.Control type="month" value={periodo} onChange={(e) => setPeriodo(e.target.value)} />
                        </Col>
                        <Col md={2}>
                            <Button variant="success" className="w-100" onClick={handleGerarRelatorio} disabled={isLoading}>
                                {isLoading ? 'Gerando...' : 'Atualizar Dados'}
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </div>

        {/* ÁREA DE IMPRESSÃO - REPETE PARA CADA MEDICAMENTO ENCONTRADO */}
        <div className="print-area">
            {dadosRelatorio.map((pagina, index) => (
                <div key={index} className="page-break-after-always">
                    {/* CABEÇALHO SNGPC */}
                    <div className="border border-dark p-3 mb-3">
                        <Row>
                            <Col xs={8}>
                                <h4 className="fw-bold text-uppercase mb-1">LIVRO DE REGISTRO ESPECÍFICO</h4>
                                <h5 className="mb-0 text-muted">LISTA {tipoLista} - PORTARIA 344/98</h5>
                            </Col>
                            <Col xs={4} className="text-end small">
                                <div><strong>FARMÁCIA MUNICIPAL</strong></div>
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
                                    <td className="text-center">{new Date(mov.data).toLocaleDateString('pt-BR')}</td>
                                    <td><strong>{mov.docNumero}</strong></td>
                                    <td className="text-truncate" style={{maxWidth: '150px'}}>{mov.origemDestino}</td>
                                    <td className="text-truncate" style={{maxWidth: '150px'}}>{mov.prescritor}</td>
                                    <td className="text-center text-success fw-bold">{mov.qtdEntrada || '-'}</td>
                                    <td className="text-center text-danger fw-bold">{mov.qtdSaida || '-'}</td>
                                    <td className="text-center text-warning fw-bold">{mov.qtdPerda || '-'}</td>
                                    <td className="text-center bg-light fw-bold">{mov.saldo}</td>
                                </tr>
                            ))}
                            {/* Linhas vazias para preencher folha se necessário */}
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
          @page { size: A4 landscape; margin: 10mm; }
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .table-bordered-dark th, .table-bordered-dark td { border: 1px solid #000 !important; }
          .fs-print-small { font-size: 10px; }
          .page-break-after-always { page-break-after: always; }
        }
      `}</style>
    </Container>
  );
};

export default RelatoriosPage;