import React, { useState, useEffect } from 'react';
import { Button, Card, Form, Row, Col, Table, Alert, Modal, Badge } from 'react-bootstrap';
import type { DispensacaoFormData, ItemDispensacaoForm } from '../../types/Dispensacao';
import type { Medicamento } from '../../types/Medicamento';
import type { Estabelecimento } from '../../types/Estabelecimento';
import type { Paciente } from '../../types/Paciente';
import type { ProfissionalSaude } from '../../types/ProfissionalSaude';
import type { EstoqueLote } from '../../types/Estoque';
import { FaPlus, FaExclamationTriangle, FaBoxOpen } from 'react-icons/fa';
import { estoqueService } from '../../store/services/estoqueService';
import { retiradaService } from '../../store/services/retiradaService';


interface LoteDispensacao {
  loteId: string;
  numeroLote: string;
  dataValidade: string;
  quantidadeDisponivel: number;
  quantidadeSelecionada: number;
}

interface DispensacaoFormProps {
  estabelecimentos: Estabelecimento[];
  medicamentos: Medicamento[];
  profissionais: ProfissionalSaude[];
  pacientes: Paciente[];
  onSubmit: (data: DispensacaoFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const DispensacaoForm: React.FC<DispensacaoFormProps> = ({
  estabelecimentos,
  medicamentos,
  profissionais,
  pacientes,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const estabelecimentoLogado = estabelecimentos.length > 0 ? estabelecimentos[0] : null;
  const estabelecimentoIdInicial = estabelecimentoLogado ? estabelecimentoLogado.id : '';

  const [formData, setFormData] = useState<DispensacaoFormData>({
    pacienteNome: '',
    pacienteCpf: '',
    profissionalSaudeId: '',
    profissionalSaudeNome: '',
    documentoReferencia: '',
    observacao: '',
    itens: [],
    estabelecimentoOrigemId: estabelecimentoIdInicial
  });

  const [novoItem, setNovoItem] = useState<ItemDispensacaoForm>({
    medicamentoId: '',
    quantidadeSaida: 0
  });

  const [estoqueDisponivel, setEstoqueDisponivel] = useState<number>(0);
  const [tipoDocumento, setTipoDocumento] = useState<'COMUM' | 'PSICOTROPICO'>('COMUM');

  const [alertasRetirada, setAlertasRetirada] = useState<{ [key: string]: string }>({});
  const [showModalJustificativa, setShowModalJustificativa] = useState(false);
  const [justificativaTemp, setJustificativaTemp] = useState('');
  const [medicamentoPendente, setMedicamentoPendente] = useState<string | null>(null);

  // ✅ NOVOS ESTADOS PARA SELEÇÃO DE LOTES
  const [showModalLotes, setShowModalLotes] = useState(false);
  const [itemSelecionadoParaLotes, setItemSelecionadoParaLotes] = useState<ItemDispensacaoForm | null>(null);
  const [lotesDisponiveis, setLotesDisponiveis] = useState<EstoqueLote[]>([]);
  const [loadingLotes, setLoadingLotes] = useState(false);

  useEffect(() => {
    if (estabelecimentoLogado && formData.estabelecimentoOrigemId !== estabelecimentoLogado.id) {
      setFormData(prev => ({
        ...prev,
        estabelecimentoOrigemId: estabelecimentoLogado.id
      }));
    }
  }, [estabelecimentoLogado]);

  // ✅ FUNÇÃO PARA CARREGAR LOTES
  const carregarLotesDispensacao = async (medicamentoId: string, estabelecimentoId: string) => {
    try {
      setLoadingLotes(true);
      console.log('📦 Carregando lotes para dispensação:', { medicamentoId, estabelecimentoId });

      const lotes = await estoqueService.getLotesDisponiveis(medicamentoId, estabelecimentoId);
      console.log('✅ Lotes carregados:', lotes);

      setLotesDisponiveis(lotes);
      return lotes;
    } catch (error) {
      console.error('❌ Erro ao carregar lotes:', error);
      setLotesDisponiveis([]);
      return [];
    } finally {
      setLoadingLotes(false);
    }
  };

  // ✅ FUNÇÃO PARA ABRIR MODAL DE LOTES
  const abrirModalLotes = async (item: ItemDispensacaoForm) => {
    if (!formData.estabelecimentoOrigemId) {
      alert('Estabelecimento não definido');
      return;
    }

    setItemSelecionadoParaLotes(item);

    try {
      await carregarLotesDispensacao(item.medicamentoId, formData.estabelecimentoOrigemId);
      setShowModalLotes(true);
    } catch (error) {
      alert('Erro ao carregar lotes disponíveis');
    }
  };

  // ✅ FUNÇÃO PARA FECHAR MODAL DE LOTES
  const fecharModalLotes = () => {
    setShowModalLotes(false);
    setItemSelecionadoParaLotes(null);
    setLotesDisponiveis([]);
  };

  // ✅ FUNÇÕES PARA MANIPULAR LOTES NO MODAL
  const atualizarQuantidadeLoteDispensacao = (loteId: string, quantidade: number) => {
    if (!itemSelecionadoParaLotes) return;

    const lotesAtualizados = itemSelecionadoParaLotes.lotesSelecionados?.map(lote =>
      lote.loteId === loteId
        ? { ...lote, quantidadeSelecionada: Math.max(0, Math.min(quantidade, lote.quantidadeDisponivel)) }
        : lote
    ) || [];

    setItemSelecionadoParaLotes({
      ...itemSelecionadoParaLotes,
      lotesSelecionados: lotesAtualizados
    } as any);
  };

  const adicionarLoteDispensacao = (lote: EstoqueLote) => {
    if (!itemSelecionadoParaLotes) return;

    const loteJaSelecionado = (itemSelecionadoParaLotes as any).lotesSelecionados?.some((l: LoteDispensacao) => l.loteId === lote.id);
    if (loteJaSelecionado) return;

    const novoLote: LoteDispensacao = {
      loteId: lote.id,
      numeroLote: lote.numeroLote,
      dataValidade: lote.dataValidade,
      quantidadeDisponivel: lote.quantidade,
      quantidadeSelecionada: 0
    };

    const lotesAtualizados = [...((itemSelecionadoParaLotes as any).lotesSelecionados || []), novoLote];

    setItemSelecionadoParaLotes({
      ...itemSelecionadoParaLotes,
      lotesSelecionados: lotesAtualizados
    } as any);
  };

  const removerLoteDispensacao = (loteId: string) => {
    if (!itemSelecionadoParaLotes) return;

    const lotesAtualizados = (itemSelecionadoParaLotes as any).lotesSelecionados?.filter((lote: LoteDispensacao) => lote.loteId !== loteId) || [];

    setItemSelecionadoParaLotes({
      ...itemSelecionadoParaLotes,
      lotesSelecionados: lotesAtualizados
    } as any);
  };

  // ✅ FUNÇÃO PARA DISTRIBUIÇÃO AUTOMÁTICA FIFO
  const distribuirAutomaticamenteDispensacao = () => {
    if (!itemSelecionadoParaLotes) return;

    const quantidadeTotal = itemSelecionadoParaLotes.quantidadeSaida;
    const lotesOrdenados = [...lotesDisponiveis]
      .sort((a, b) => new Date(a.dataValidade).getTime() - new Date(b.dataValidade).getTime());

    let quantidadeRestante = quantidadeTotal;
    const lotesSelecionados: LoteDispensacao[] = [];

    for (const lote of lotesOrdenados) {
      if (quantidadeRestante <= 0) break;

      const quantidadeLote = Math.min(quantidadeRestante, lote.quantidade);
      lotesSelecionados.push({
        loteId: lote.id,
        numeroLote: lote.numeroLote,
        dataValidade: lote.dataValidade,
        quantidadeDisponivel: lote.quantidade,
        quantidadeSelecionada: quantidadeLote
      });

      quantidadeRestante -= quantidadeLote;
    }

    setItemSelecionadoParaLotes({
      ...itemSelecionadoParaLotes,
      lotesSelecionados
    } as any);
  };

  // ✅ FUNÇÃO PARA CONFIRMAR SELEÇÃO DE LOTES
  const confirmarSelecaoLotes = () => {
    if (!itemSelecionadoParaLotes) return;

    const totalLotes = (itemSelecionadoParaLotes as any).lotesSelecionados?.reduce((sum: number, lote: LoteDispensacao) =>
      sum + lote.quantidadeSelecionada, 0) || 0;

    if (totalLotes !== itemSelecionadoParaLotes.quantidadeSaida) {
      alert(`A soma dos lotes (${totalLotes}) não corresponde à quantidade da dispensação (${itemSelecionadoParaLotes.quantidadeSaida})`);
      return;
    }

    setFormData(prev => ({
      ...prev,
      itens: prev.itens.map(item =>
        item.medicamentoId === itemSelecionadoParaLotes!.medicamentoId
          ? { ...itemSelecionadoParaLotes! }
          : item
      )
    }));

    fecharModalLotes();
  };

  const verificarRetiradaRecente = async (medicamentoId: string) => {
    console.log('🔍 Iniciando verificação de retirada recente...');
    console.log('📋 Dados para verificação:', {
      pacienteCpf: formData.pacienteCpf,
      medicamentoId: medicamentoId,
      estabelecimentoId: formData.estabelecimentoOrigemId
    });
    if (!formData.pacienteCpf || !formData.estabelecimentoOrigemId) return;

    try {
      console.log('🔍 Verificando retirada recente para:', medicamentoId);
      const resultado = await retiradaService.verifyRetiradaRecente({
        pacienteCpf: formData.pacienteCpf,
        medicamentoId: medicamentoId,
        estabelecimentoId: formData.estabelecimentoOrigemId
      });

      if (resultado.existeRetirada) {
        setAlertasRetirada(prev => ({
          ...prev,
          [medicamentoId]: resultado.mensagem!
        }));
        setMedicamentoPendente(medicamentoId);
      }
    } catch (error) {
      console.error('Erro ao verificar retirada recente:', error);
    }
  };

  const gerarNumeroAutomatico = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();

    let prefixo = 'DISP';
    if (estabelecimentoLogado?.nome) {
      prefixo = estabelecimentoLogado.nome
        .substring(0, 4)
        .toUpperCase()
        .replace(/\s/g, '');
    }

    return `${prefixo}-${timestamp}-${random}`;
  };

  useEffect(() => {
    if (!formData.documentoReferencia || formData.documentoReferencia.trim() === '') {
      const numeroAutomatico = gerarNumeroAutomatico();
      setFormData(prev => ({
        ...prev,
        documentoReferencia: numeroAutomatico
      }));
      console.log('🔢 Número automático gerado:', numeroAutomatico);
    }
  }, []);

  const handleMedicamentoChange = async (medicamentoId: string) => {
    setNovoItem(prev => ({
      ...prev,
      medicamentoId,
      quantidadeSaida: 0
    }));

    if (medicamentoId && formData.estabelecimentoOrigemId) {
      try {
        const estoque = await estoqueService.getEstoqueMedicamento(
          medicamentoId,
          formData.estabelecimentoOrigemId
        );
        setEstoqueDisponivel(estoque);

        if (formData.pacienteCpf) {
          verificarRetiradaRecente(medicamentoId);
        }
      } catch (error) {
        console.error('Erro ao buscar estoque:', error);
        setEstoqueDisponivel(0);
      }
    } else {
      setEstoqueDisponivel(0);
    }
  };
  // ✅ FUNÇÃO ADICIONAR ITEM ATUALIZADA (SEM O POP-UP CHATO)
  const adicionarItem = async () => {
    // 1. Validações Básicas
    if (!novoItem.medicamentoId || novoItem.quantidadeSaida <= 0) {
      alert('Selecione um medicamento e informe a quantidade');
      return;
    }

    // 2. Validação de Estoque
    if (novoItem.quantidadeSaida > estoqueDisponivel) {
      alert(`Quantidade solicitada (${novoItem.quantidadeSaida}) excede o estoque disponível (${estoqueDisponivel})`);
      return;
    }

    // 3. Validação de Retirada Recente (Mantém o fluxo de justificativa se necessário)
    if (alertasRetirada[novoItem.medicamentoId]) {
      setMedicamentoPendente(novoItem.medicamentoId);
      setShowModalJustificativa(true);
      return;
    }

    // --- REMOVIDO O WINDOW.CONFIRM ---
    // Agora o sistema adiciona o item diretamente. 
    // O sistema assumirá FIFO automático a menos que o usuário edite o lote na tabela depois.

    setFormData(prev => ({
      ...prev,
      itens: [...prev.itens, { ...novoItem }]
    }));

    // Limpa os campos para o próximo item
    setNovoItem({
      medicamentoId: '',
      quantidadeSaida: 0
    });
    setEstoqueDisponivel(0);
  };
  const handleConfirmarJustificativa = () => {
    if (!justificativaTemp.trim()) {
      alert('Por favor, informe uma justificativa para a retirada antecipada.');
      return;
    }

    if (medicamentoPendente && novoItem.medicamentoId === medicamentoPendente) {
      setFormData(prev => ({
        ...prev,
        itens: [...prev.itens, { ...novoItem }],
        justificativaRetiradaAntecipada: justificativaTemp,
        usuarioAutorizador: 'Sistema'
      }));

      setNovoItem({
        medicamentoId: '',
        quantidadeSaida: 0
      });
      setEstoqueDisponivel(0);
    }

    setShowModalJustificativa(false);
    setJustificativaTemp('');
    setMedicamentoPendente(null);
  };

  const removerItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      itens: prev.itens.filter((_, i) => i !== index)
    }));
  };

  // No handleSubmit, ajuste o formato dos dados enviados:
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.estabelecimentoOrigemId) {
      alert('Erro interno: Estabelecimento não definido. Recarregue a página.');
      return;
    }

    if (!formData.pacienteNome.trim()) {
      alert('Nome do paciente é obrigatório');
      return;
    }

    if (formData.itens.length === 0) {
      alert('Adicione pelo menos um medicamento à dispensação');
      return;
    }

    if (!formData.documentoReferencia.trim()) {
      alert('Documento de referência é obrigatório');
      return;
    }

    const dadosParaEnviar: DispensacaoCreateData = {
      pacienteNome: formData.pacienteNome,
      pacienteCpf: formData.pacienteCpf,
      pacienteId: formData.pacienteId,
      profissionalSaudeId: formData.profissionalSaudeId,
      profissionalSaudeNome: formData.profissionalSaudeNome,
      documentoReferencia: formData.documentoReferencia,
      observacao: formData.observacao,
      estabelecimentoOrigemId: formData.estabelecimentoOrigemId,
      justificativaRetiradaAntecipada: formData.justificativaRetiradaAntecipada,
      usuarioAutorizador: formData.usuarioAutorizador,
      itens: formData.itens.map(item => ({
        medicamentoId: item.medicamentoId,
        quantidadeSaida: item.quantidadeSaida,
        // ✅ CONVERTE OS LOTES SELECIONADOS PARA O FORMATO DO BACKEND
        lotes: item.lotesSelecionados?.map(lote => ({
          loteId: lote.loteId,
          numeroLote: lote.numeroLote,
          quantidade: lote.quantidadeSelecionada
        })) || []
      }))
    };

    onSubmit(dadosParaEnviar);
  };

  useEffect(() => {
    if (formData.pacienteCpf && formData.itens.length > 0) {
      formData.itens.forEach(item => {
        verificarRetiradaRecente(item.medicamentoId);
      });
    }
  }, [formData.pacienteCpf]);

  const medicamentoSelecionado = medicamentos.find(m => m.id === novoItem.medicamentoId);

  if (!estabelecimentoLogado) {
    return (
      <Card>
        <Card.Header>
          <h5 className="card-title mb-0 fw-bold">Dispensação de Medicamentos</h5>
        </Card.Header>
        <Card.Body>
          <Alert variant="danger" className="p-4">
            Não foi possível carregar o estabelecimento do usuário. Recarregue a página ou entre em contato com o suporte.
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <Card.Header>
          <h5 className="card-title mb-0 fw-bold">Dispensação de Medicamentos</h5>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            {/* Dados do Paciente (mantido igual) */}
            <Card className="mb-4">
              <Card.Header>
                <h6 className="mb-0">Dados do Paciente</h6>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Paciente *</Form.Label>
                      <Form.Select
                        value={formData.pacienteId || ''}
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          if (selectedId) {
                            const pacienteSelecionado = pacientes.find(p => p.id === selectedId);
                            setFormData(prev => ({
                              ...prev,
                              pacienteId: selectedId,
                              pacienteNome: pacienteSelecionado?.nome || '',
                              pacienteCpf: pacienteSelecionado?.cpf || ''
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              pacienteId: undefined,
                              pacienteNome: '',
                              pacienteCpf: ''
                            }));
                          }
                        }}
                      >
                        <option value="">Selecione ou digite abaixo...</option>
                        {pacientes.map(paciente => (
                          <option key={paciente.id} value={paciente.id}>
                            {paciente.nome} {paciente.cpf ? `(CPF: ${paciente.cpf})` : ''}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Nome do Paciente *</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.pacienteNome}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          pacienteNome: e.target.value,
                          pacienteId: undefined,
                          pacienteCpf: ''
                        }))}
                        placeholder="Digite o nome completo do paciente..."
                        disabled={!!formData.pacienteId}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>CPF</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.pacienteCpf}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          pacienteCpf: e.target.value
                        }))}
                        placeholder="000.000.000-00"
                        disabled={!!formData.pacienteId}
                      />
                      <Form.Text className="text-muted">
                        {formData.pacienteId ? 'CPF preenchido automaticamente' : 'Opcional para pacientes não cadastrados'}
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Dados da Dispensação */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Estabelecimento *</Form.Label>
                  <Form.Control
                    type="text"
                    value={estabelecimentoLogado.nome}
                    disabled
                    readOnly
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Tipo de Documento *</Form.Label>
                  <Form.Select
                    value={tipoDocumento}
                    onChange={(e) => {
                      setTipoDocumento(e.target.value as 'COMUM' | 'PSICOTROPICO');
                      if (e.target.value === 'COMUM') {
                        setFormData(prev => ({
                          ...prev,
                          documentoReferencia: `DISP-${Date.now()}`
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          documentoReferencia: ''
                        }));
                      }
                    }}
                  >
                    <option value="COMUM">Dispensação Comum</option>
                    <option value="PSICOTROPICO">Psicotrópico (Controlado)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Profissional de Saúde</Form.Label>
                  <Form.Select
                    value={formData.profissionalSaudeId || ''}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        profissionalSaudeId: selectedId || undefined,
                        profissionalSaudeNome: selectedId ? '' : prev.profissionalSaudeNome
                      }));
                    }}
                  >
                    <option value="">Selecione ou digite abaixo...</option>
                    {profissionais.map(profissional => (
                      <option key={profissional.id} value={profissional.id}>
                        {profissional.nome} {profissional.crm ? `(CRM: ${profissional.crm})` : ''}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Nome do Profissional (Dentistas)</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.profissionalSaudeNome || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      profissionalSaudeNome: e.target.value,
                      profissionalSaudeId: e.target.value ? undefined : prev.profissionalSaudeId
                    }))}
                    placeholder="Digite o nome do profissional..."
                    disabled={!!formData.profissionalSaudeId}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Documento de Referência *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.documentoReferencia}
                    onChange={(e) => setFormData(prev => ({ ...prev, documentoReferencia: e.target.value }))}
                    placeholder=" Digite o número da Notificação da Receita"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Observações</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.observacao}
                    onChange={(e) => setFormData(prev => ({ ...prev, observacao: e.target.value }))}
                    placeholder="Observações adicionais..."
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Medicamentos */}
            <Card className="mb-4">
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">Medicamentos para Dispensação</h6>
                  <Badge bg="info" className="fs-6">
                    ⓘ Seleção de lotes opcional
                  </Badge>
                </div>
              </Card.Header>
              <Card.Body>
                <Row className="g-2">
                  <Col md={5}>
                    <Form.Group>
                      <Form.Label>Medicamento *</Form.Label>
                      <Form.Select
                        value={novoItem.medicamentoId}
                        onChange={(e) => handleMedicamentoChange(e.target.value)}
                      >
                        <option value="">Selecione...</option>
                        {medicamentos.map(med => (
                          <option key={med.id} value={med.id}>
                            {med.principioAtivo} 
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Quantidade *</Form.Label>
                      <Form.Control
                        type="text"
                        value={novoItem.quantidadeSaida === 0 ? '' : novoItem.quantidadeSaida}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || /^\d+$/.test(value)) {
                            const numValue = value === '' ? 0 : Number(value);
                            if (numValue <= estoqueDisponivel) {
                              setNovoItem(prev => ({ ...prev, quantidadeSaida: numValue }));
                            } else {
                              alert(`Quantidade não pode exceder o estoque disponível: ${estoqueDisponivel}`);
                            }
                          }
                        }}
                        placeholder="Digite a quantidade"
                        disabled={estoqueDisponivel === 0}
                        title={`Estoque disponível: ${estoqueDisponivel}`}
                      />
                      {estoqueDisponivel > 0 && (
                        <Form.Text className="text-muted">
                          Estoque disponível: <strong>{estoqueDisponivel}</strong>
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={4} className="d-flex align-items-end">
                    <div className="w-100">
                      {novoItem.medicamentoId && (
                        <Alert
                          variant={estoqueDisponivel > 0 ? "info" : "warning"}
                          className="py-2 mb-2"
                        >
                          <small>
                            Estoque disponível: <strong>{estoqueDisponivel}</strong>
                            {estoqueDisponivel === 0 && " - Não é possível adicionar"}
                          </small>
                        </Alert>
                      )}
                      <Button
                        variant="primary"
                        onClick={adicionarItem}
                        className="w-100"
                        disabled={estoqueDisponivel === 0 || novoItem.quantidadeSaida === 0}
                        title="Clique para adicionar - Você poderá escolher os lotes depois"
                      >
                        <FaPlus className="me-2" />
                        Adicionar
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Itens Adicionados */}
            {formData.itens.length > 0 && (
              <Card className="mb-4">
                <Card.Header>
                  <h6 className="mb-0">Medicamentos da Dispensação ({formData.itens.length})</h6>
                </Card.Header>
                <Card.Body>
                  <Table striped bordered>
                    <thead>
                      <tr>
                        <th>Medicamento</th>
                        <th>Quantidade</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.itens.map((item, index) => {
                        const medicamento = medicamentos.find(m => m.id === item.medicamentoId);
                        const temLotesSelecionados = item.lotesSelecionados && item.lotesSelecionados.length > 0;

                        return (
                          <tr key={index}>
                            <td>
                              {medicamento?.principioAtivo} {medicamento?.concentracao}
                              {temLotesSelecionados && (
                                <Badge bg="success" className="ms-1" title="Lotes selecionados manualmente">
                                  ✓
                                </Badge>
                              )}
                            </td>
                            <td>{item.quantidadeSaida}</td>
                            <td>
                              <div className="d-flex gap-1">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => abrirModalLotes(item)}
                                  title="Selecionar lotes específicos"
                                >
                                  <FaBoxOpen />
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => removerItem(index)}
                                >
                                  Remover
                                </Button>
                              </div>

                              {/* Mostra resumo dos lotes se houver seleção */}
                              {temLotesSelecionados && (
                                <div className="mt-1">
                                  <small className="text-muted">
                                    <strong>Lotes:</strong> {item.lotesSelecionados!.map(lote =>
                                      `${lote.numeroLote} (${lote.quantidadeSelecionada})`
                                    ).join(', ')}
                                  </small>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            )}

            {/* Botões */}
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
                Cancelar
              </Button>
              <Button
                variant="success"
                type="submit"
                disabled={isLoading || formData.itens.length === 0 || !formData.pacienteNome.trim()}
              >
                {isLoading ? 'Registrando...' : 'Finalizar Dispensação'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Modal para Justificativa */}
      <Modal show={showModalJustificativa} onHide={() => setShowModalJustificativa(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaExclamationTriangle className="text-warning me-2" />
            Justificativa para Retirada Antecipada
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {medicamentoPendente && (
            <Alert variant="warning" className="mb-3">
              <strong>Medicamento:</strong> {medicamentos.find(m => m.id === medicamentoPendente)?.principioAtivo}
              <br />
              <strong>Paciente:</strong> {formData.pacienteNome}
            </Alert>
          )}
          <Form.Group>
            <Form.Label>Justificativa *</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={justificativaTemp}
              onChange={(e) => setJustificativaTemp(e.target.value)}
              placeholder="Descreva o motivo da retirada antecipada..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalJustificativa(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleConfirmarJustificativa}>
            Confirmar Justificativa
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ✅ NOVO MODAL PARA SELEÇÃO DE LOTES */}
      <Modal show={showModalLotes} onHide={fecharModalLotes} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Selecionar Lotes - {itemSelecionadoParaLotes && medicamentos.find(m => m.id === itemSelecionadoParaLotes.medicamentoId)?.principioAtivo}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {itemSelecionadoParaLotes && (
            <Alert variant="info">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <strong>Medicamento:</strong> {itemSelecionadoParaLotes && medicamentos.find(m => m.id === itemSelecionadoParaLotes.medicamentoId)?.principioAtivo}
                  <br />
                  <strong>Quantidade total:</strong> {itemSelecionadoParaLotes?.quantidadeSaida} unidades
                  <br />
                  <strong>Total selecionado:</strong> {(itemSelecionadoParaLotes as any).lotesSelecionados?.reduce((sum: number, lote: LoteDispensacao) => sum + lote.quantidadeSelecionada, 0) || 0} unidades
                </div>
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={distribuirAutomaticamenteDispensacao}
                  title="Distribuir automaticamente por validade (FIFO)"
                >
                  🚀 FIFO Automático
                </Button>
              </div>

              {(itemSelecionadoParaLotes as any).lotesSelecionados &&
                (itemSelecionadoParaLotes as any).lotesSelecionados.reduce((sum: number, lote: LoteDispensacao) => sum + lote.quantidadeSelecionada, 0) !== itemSelecionadoParaLotes.quantidadeSaida && (
                  <Alert variant="warning" className="mt-2 mb-0 py-2">
                    ⚠️ A soma dos lotes não coincide com a quantidade total
                  </Alert>
                )}
            </Alert>
          )}

          <div className="mb-3">
            <Button variant="outline-success" size="sm" onClick={distribuirAutomaticamenteDispensacao}>
              Distribuir Automaticamente (FIFO)
            </Button>
          </div>

          <Table striped bordered size="sm">
            <thead>
              <tr>
                <th>Selecionar</th>
                <th>Lote</th>
                <th>Validade</th>
                <th>Disponível</th>
                <th>Quantidade</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {lotesDisponiveis.map(lote => {
                const loteSelecionado = (itemSelecionadoParaLotes as any)?.lotesSelecionados?.find((l: LoteDispensacao) => l.loteId === lote.id);
                const isSelecionado = !!loteSelecionado;

                return (
                  <tr key={lote.id}>
                    <td>
                      {!isSelecionado ? (
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => adicionarLoteDispensacao(lote)}
                          disabled={lote.quantidade <= 0}
                        >
                          {lote.quantidade <= 0 ? 'Indisponível' : 'Adicionar'}
                        </Button>
                      ) : (
                        <Badge bg="success">Selecionado</Badge>
                      )}
                    </td>
                    <td>{lote.numeroLote}</td>
                    <td>{new Date(lote.dataValidade).toLocaleDateString()}</td>
                    <td>{lote.quantidade}</td>
                    <td style={{ width: '120px' }}>
                      {isSelecionado && (
                        <Form.Control
                          type="number"
                          min="0"
                          max={lote.quantidade}
                          value={loteSelecionado.quantidadeSelecionada}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            atualizarQuantidadeLoteDispensacao(lote.id, value);
                          }}
                        />
                      )}
                    </td>
                    <td>
                      {isSelecionado && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => removerLoteDispensacao(lote.id)}
                        >
                          Remover
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={fecharModalLotes}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={confirmarSelecaoLotes}>
            Confirmar Lotes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DispensacaoForm;