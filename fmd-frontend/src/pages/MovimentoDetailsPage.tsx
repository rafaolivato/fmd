import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Spinner, Alert, } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPrint } from 'react-icons/fa';
import type { Movimento } from '../types/Movimento';
import { movimentoService } from '../store/services/movimentoService';

const MovimentoDetailsPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movimento, setMovimento] = useState<Movimento | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            loadMovimento(id);
        }
    }, [id]);

    const loadMovimento = async (movimentoId: string) => {
        try {
            setIsLoading(true);
            setError(null);

            console.log('🔍 Iniciando carga do movimento ID:', movimentoId);

            // ✅ CHAMADA REAL DA API
            const data = await movimentoService.getById(movimentoId);
            console.log('✅ Dados recebidos da API:', data);

            if (!data) {
                console.log('❌ Dados são null ou undefined');
                setError('Dados do movimento não encontrados');
                return;
            }

            console.log('📦 Estrutura completa do movimento:', JSON.stringify(data, null, 2));

            // ✅ CORREÇÃO: Garantir que os valores unitários estejam presentes
            if (data.itensMovimentados && data.itensMovimentados.length > 0) {
                console.log('🎯 Primeiro item detalhado:', data.itensMovimentados[0]);
                console.log('💰 Valor unitário:', data.itensMovimentados[0].valorUnitario);
                console.log('🔑 Campos do item:', Object.keys(data.itensMovimentados[0]));
                
                // Log para debug dos valores
                data.itensMovimentados.forEach((item, index) => {
                    console.log(`📊 Item ${index + 1}:`, {
                        medicamento: item.medicamento.principioAtivo,
                        valorUnitario: item.valorUnitario,
                        quantidade: item.quantidade,
                        tipoMovimento: data.tipoMovimentacao
                    });
                });
            } else {
                console.log('⚠️  Nenhum item encontrado no movimento');
            }

            setMovimento(data);

        } catch (err) {
            console.error('❌ Erro ao carregar movimento:', err);
            setError('Erro ao carregar detalhes do movimento');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('pt-BR');
        } catch {
            return dateString;
        }
    };

    // ✅ CORREÇÃO MELHORADA: Função para obter valor unitário seguro
    const getValorUnitarioSeguro = (item: any) => {
        // Se for ENTRADA, usa o valor unitário diretamente
        if (movimento?.tipoMovimentacao === 'ENTRADA') {
            return item.valorUnitario ?? 0;
        }
        
        // Se for SAÍDA, tenta usar o valor unitário do item
        // Se não tiver, poderia buscar do histórico (depende da sua lógica de negócio)
        return item.valorUnitario ?? item.valorUnitarioEntrada ?? 0;
    };

    // ✅ CORREÇÃO: Função segura para formatação de moeda
    const formatCurrency = (value: number | null | undefined) => {
        const numericValue = value ?? 0;
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(numericValue);
    };

    const getTotalItens = () => {
        if (!movimento || !movimento.itensMovimentados) return 0;
        return movimento.itensMovimentados.reduce((total, item) => total + (item.quantidade ?? 0), 0);
    };

    // ✅ CORREÇÃO MELHORADA: Função para calcular o total geral
    const calcularTotalGeral = () => {
        if (!movimento || !movimento.itensMovimentados) return 0;

        const total = movimento.itensMovimentados.reduce((soma, item) => {
            const valorUnitarioSeguro = getValorUnitarioSeguro(item);
            const quantidadeSegura = item.quantidade ?? 0;

            const valorItem = valorUnitarioSeguro * quantidadeSegura;
            console.log(`💰 ${movimento?.tipoMovimentacao} - Item ${item.medicamento.principioAtivo}: ${quantidadeSegura} x ${valorUnitarioSeguro} = ${valorItem}`);
            return soma + valorItem;
        }, 0);

        console.log(`🎯 Total Geral Calculado para ${movimento?.tipoMovimentacao}: ${total}`);
        return total;
    };

    // ✅ NOVA FUNÇÃO: Calcular valor total por item
    const calcularTotalItem = (item: any) => {
        const valorUnitarioSeguro = getValorUnitarioSeguro(item);
        const quantidadeSegura = item.quantidade ?? 0;
        return valorUnitarioSeguro * quantidadeSegura;
    };

    const getFonteFinanciamentoFormatada = (fonte: string) => {
        const fontes: { [key: string]: string } = {
            'RECURSOS_PROPRIOS': 'Recursos Próprios',
            'RECURSOS_PRO_PRIOS': 'Recursos Próprios',
            'SUS': 'SUS',
            'CONVENIO': 'Convênio',
            'DOACAO': 'Doação',
            'TRANSFERENCIA': 'Transferência'
        };
        return fontes[fonte] || fonte;
    };

    if (isLoading) {
        return (
            <Container fluid>
                <div className="text-center py-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Carregando...</span>
                    </Spinner>
                    <p className="mt-2">Carregando detalhes do movimento...</p>
                </div>
            </Container>
        );
    }

    if (error || !movimento) {
        return (
            <Container fluid>
                <Alert variant="danger">
                    <Alert.Heading>Erro</Alert.Heading>
                    <p>{error || 'Movimento não encontrado'}</p>
                    <Button variant="primary" onClick={() => navigate('/movimentos')}>
                        Voltar para Movimentos
                    </Button>
                </Alert>
            </Container>
        );
    }

    function handlePrint(event: React.MouseEvent<HTMLButtonElement>): void {
        event.preventDefault();
        window.print();
    }

    return (
        <Container fluid>
            <Row className="mt-4 mb-4">
                <Col>
                    <Button variant="outline-primary" onClick={() => navigate(-1)}>
                        <FaArrowLeft className="w-4 h-4 me-2" />
                        Voltar para Movimentos
                    </Button>
                </Col>
                <Col xs="auto">
                    <Button variant="outline-secondary" onClick={handlePrint} className="no-print">
                      <FaPrint className="w-4 h-4 me-2" />
                        Imprimir
                    </Button>
                </Col>
            </Row>

            <Row>
                <Col lg={12}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0">
                                Detalhes do Movimento {movimento.numeroDocumento}
                            </h5>
                            <Badge bg={movimento.tipoMovimentacao === 'ENTRADA' ? 'success' : 'warning'}>
                                {movimento.tipoMovimentacao}
                            </Badge>
                        </Card.Header>
                        <Card.Body>
                            {/* Informações Gerais */}
                            <Row className="mb-4">
                                <Col md={6}>
                                    <h6>Informações do Movimento</h6>
                                    <Table borderless size="sm">
                                        <tbody>
                                            <tr>
                                                <td><strong>Data Documento:</strong></td>
                                                <td>{formatDate(movimento.dataDocumento)}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Data Recebimento:</strong></td>
                                                <td>{formatDate(movimento.dataRecebimento)}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Documento:</strong></td>
                                                <td>{movimento.numeroDocumento} ({movimento.documentoTipo})</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Criado em:</strong></td>
                                                <td>{formatDate(movimento.createdAt)}</td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                </Col>
                                <Col md={6}>
                                    <h6>Referência</h6>
                                    <Table borderless size="sm">
                                        <tbody>
                                            {movimento.tipoMovimentacao === 'ENTRADA' ? (
                                                <>
                                                    <tr>
                                                        <td><strong>Fornecedor:</strong></td>
                                                        <td>{movimento.fornecedor}</td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>Fonte Financiamento:</strong></td>
                                                        <td>{getFonteFinanciamentoFormatada(movimento.fonteFinanciamento)}</td>
                                                    </tr>
                                                </>
                                            ) : (
                                                <>
                                                    <tr>
                                                        <td><strong>Fornecedor/Referência:</strong></td>
                                                        <td>{movimento.fornecedor || movimento.observacao || 'Saída diversa'}</td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>Fonte Financiamento:</strong></td>
                                                        <td>{getFonteFinanciamentoFormatada(movimento.fonteFinanciamento)}</td>
                                                    </tr>
                                                    {movimento.observacao && (
                                                        <tr>
                                                            <td><strong>Observações:</strong></td>
                                                            <td>{movimento.observacao}</td>
                                                        </tr>
                                                    )}
                                                </>
                                            )}
                                        </tbody>
                                    </Table>
                                </Col>
                            </Row>

                            {/* Itens do Movimento */}
                            <h6>Itens do Movimento</h6>
                            <Table striped bordered responsive>
                                <thead>
                                    <tr>
                                        <th>Medicamento</th>
                                        <th>Lote</th>
                                        <th>Validade</th>
                                        <th>Quantidade</th>
                                        <th>Valor Unit.</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {movimento.itensMovimentados.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                <strong>{item.medicamento.principioAtivo}</strong>
                                                <br />
                                                <small className="text-muted">
                                                    {item.medicamento.concentracao} - {item.medicamento.formaFarmaceutica}
                                                </small>
                                                {item.fabricante && (
                                                    <>
                                                        <br />
                                                        <small className="text-muted">Fabricante: {item.fabricante}</small>
                                                    </>
                                                )}
                                            </td>
                                            <td>{item.numeroLote}</td>
                                            <td>{formatDate(item.dataValidade)}</td>
                                            <td>{item.quantidade ?? 0}</td>

                                            {/* ✅ CORREÇÃO: Usando a função melhorada para valor unitário */}
                                            <td>
                                                {formatCurrency(getValorUnitarioSeguro(item))}
                                            </td>

                                            {/* ✅ CORREÇÃO: Usando função específica para cálculo do total do item */}
                                            <td>{formatCurrency(calcularTotalItem(item))}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={3} className="text-end fw-bold">Total Geral:</td>
                                        <td className="fw-bold">{getTotalItens()} unidades</td>
                                        <td colSpan={2} className="fw-bold">
                                            {formatCurrency(calcularTotalGeral())}
                                        </td>
                                    </tr>
                                </tfoot>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default MovimentoDetailsPage;