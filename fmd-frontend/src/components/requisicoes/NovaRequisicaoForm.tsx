import React, { useState, useEffect } from 'react';
import { Button, Card, Form, Row, Col, Table, Alert, Spinner } from 'react-bootstrap';
import type { RequisicaoFormData, ItemRequisicaoForm } from '../../types/Requisicao';
import type { Medicamento } from '../../types/Medicamento';
import type { Estabelecimento } from '../../types/Estabelecimento';
import { FaPlus, FaStore, FaExclamationTriangle } from 'react-icons/fa';

interface NovaRequisicaoFormProps {
  estabelecimentos: Estabelecimento[];
  medicamentos: Medicamento[];
  onSubmit: (data: RequisicaoFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  usuarioLogado?: {
    id: string;
    estabelecimentoId: string;
    estabelecimentoNome: string;
  };
}

const NovaRequisicaoForm: React.FC<NovaRequisicaoFormProps> = ({
  estabelecimentos,
  medicamentos,
  onSubmit,
  onCancel,
  isLoading = false,
  usuarioLogado
}) => {
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [erroAdicao, setErroAdicao] = useState<string>('');

  useEffect(() => {
    if (usuarioLogado) {
      setLoading(false);
    }
  }, [usuarioLogado]);

  const [formData, setFormData] = useState<RequisicaoFormData>({
    solicitanteId: usuarioLogado?.estabelecimentoId || '',
    atendenteId: '',
    observacao: '',
    itens: []
  });

  const [novoItem, setNovoItem] = useState<ItemRequisicaoForm>({
    medicamentoId: '',
    quantidadeSolicitada: 0
  });

  useEffect(() => {
    if (usuarioLogado?.estabelecimentoId) {
      setFormData(prev => ({
        ...prev,
        solicitanteId: usuarioLogado.estabelecimentoId
      }));
    }
  }, [usuarioLogado]);

  const almoxarifados = estabelecimentos.filter(est => {
    const estabelecimento = est as any;
    return estabelecimento.tipo && estabelecimento.tipo === 'ALMOXARIFADO';
  });

  const adicionarItem = () => {
    setErroAdicao('');

    if (!novoItem.medicamentoId) {
      setErroAdicao('Selecione um medicamento');
      return;
    }

    if (novoItem.quantidadeSolicitada <= 0) {
      setErroAdicao('Informe uma quantidade válida (maior que zero)');
      return;
    }

    const medicamentoJaAdicionado = formData.itens.find(
      item => item.medicamentoId === novoItem.medicamentoId
    );

    if (medicamentoJaAdicionado) {
      const medicamento = medicamentos.find(m => m.id === novoItem.medicamentoId);
      const nomeMedicamento = medicamento
        ? `${medicamento.principioAtivo} ${medicamento.concentracao}`
        : 'Este medicamento';

      setErroAdicao(`${nomeMedicamento} já foi adicionado à requisição com quantidade ${medicamentoJaAdicionado.quantidadeSolicitada}. Remova o item existente primeiro.`);
      return;
    }

    setFormData(prev => ({
      ...prev,
      itens: [...prev.itens, { ...novoItem }]
    }));

    setNovoItem({
      medicamentoId: '',
      quantidadeSolicitada: 0
    });
  };

  const removerItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      itens: prev.itens.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) {
      console.log('Já está enviando...');
      return;
    }

    setIsSubmitting(true);

    if (!formData.atendenteId) {
      alert('Selecione o almoxarifado atendente');
      setIsSubmitting(false);
      return;
    }

    if (formData.itens.length === 0) {
      alert('Adicione pelo menos um item à requisição');
      setIsSubmitting(false);
      return;
    }

    const dataParaEnviar = {
      atendenteId: formData.atendenteId,
      observacao: formData.observacao,
      itens: formData.itens.map(item => ({
        medicamentoId: item.medicamentoId,
        quantidadeSolicitada: Number(item.quantidadeSolicitada)
      }))
    };

    try {
      await onSubmit(dataParaEnviar as any);
    } catch (error) {
      console.error('Erro ao enviar:', error);
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
      e.preventDefault();
      const target = e.target as HTMLInputElement;

      if (target.type === 'number' && novoItem.medicamentoId && novoItem.quantidadeSolicitada > 0) {
        adicionarItem();
      }
    }
  };

  if (loading || !usuarioLogado) {
    return (
      <Card>
        <Card.Body className="text-center">
          <Spinner animation="border" role="status" className="mb-3">
            <span className="visually-hidden">Carregando...</span>
          </Spinner>
          <p>Carregando dados do usuário...</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>
        <h5 className="card-title mb-0">
          <FaStore className="me-2" />
          Nova Requisição para Almoxarifado
        </h5>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit} id="requisicao-form" noValidate>
          {/* Estabelecimentos */}
          <Row className="mb-4">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Solicitante *</Form.Label>
                <Form.Control
                  type="text"
                  value={usuarioLogado.estabelecimentoNome || 'Carregando...'}
                  disabled
                  readOnly
                />
                <Form.Text className="text-muted">
                  Seu estabelecimento (automático)
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Almoxarifado Atendente *</Form.Label>
                <Form.Select
                  value={formData.atendenteId}
                  onChange={(e) => setFormData(prev => ({ ...prev, atendenteId: e.target.value }))}
                  required
                >
                  <option value="">Selecione o almoxarifado...</option>
                  {almoxarifados.map(est => (
                    <option key={est.id} value={est.id}>{est.nome}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Observações */}
          <Form.Group className="mb-4">
            <Form.Label>Observações</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={formData.observacao}
              onChange={(e) => setFormData(prev => ({ ...prev, observacao: e.target.value }))}
              placeholder="Observações sobre a requisição..."
            />
          </Form.Group>

          {/* Adicionar Medicamentos */}
          <Card className="mb-4 border-primary">
            <Card.Header className="bg-primary text-white">
              <h6 className="mb-0">Adicionar Medicamentos</h6>
            </Card.Header>
            <Card.Body>
              {erroAdicao && (
                <Alert variant="warning" className="py-2" onClose={() => setErroAdicao('')} dismissible>
                  <FaExclamationTriangle className="me-2" />
                  {erroAdicao}
                </Alert>
              )}

              <Row className="g-2" onKeyPress={handleKeyPress}>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Medicamento *</Form.Label>
                    <Form.Select
                      value={novoItem.medicamentoId}
                      onChange={(e) => {
                        setNovoItem(prev => ({ ...prev, medicamentoId: e.target.value }));
                        setErroAdicao('');
                      }}
                      isInvalid={!!erroAdicao && !novoItem.medicamentoId}
                    >
                      <option value="">Selecione...</option>
                      {medicamentos.map(med => {
                        const jaAdicionado = formData.itens.some(
                          item => item.medicamentoId === med.id
                        );
                        return (
                          <option
                            key={med.id}
                            value={med.id}
                            disabled={jaAdicionado}
                            style={jaAdicionado ? { color: '#6c757d', fontStyle: 'italic' } : {}}
                          >
                            {med.principioAtivo} {med.concentracao}
                            {jaAdicionado && ' (já adicionado)'}
                          </option>
                        );
                      })}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Quantidade *</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      value={novoItem.quantidadeSolicitada > 0 ? novoItem.quantidadeSolicitada : ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          setNovoItem(prev => ({ ...prev, quantidadeSolicitada: 0 }));
                        } else {
                          const numValue = parseInt(value, 10);
                          if (!isNaN(numValue) && numValue > 0) {
                            setNovoItem(prev => ({ ...prev, quantidadeSolicitada: numValue }));
                          }
                        }
                        setErroAdicao('');
                      }}
                      placeholder="Digite a quantidade"
                      isInvalid={!!erroAdicao && novoItem.quantidadeSolicitada <= 0}
                    />
                  </Form.Group>
                </Col>
                <Col md={2} className="d-flex align-items-end">
                  <Button
                    variant="outline-primary"
                    onClick={adicionarItem}
                    className="w-100"
                    type="button"
                    disabled={!novoItem.medicamentoId || novoItem.quantidadeSolicitada <= 0}
                  >
                    <FaPlus className="me-2" />
                    Adicionar
                  </Button>
                </Col>
              </Row>
              </Card.Body>
          </Card>

          {/* Itens Adicionados */}
          {formData.itens.length > 0 ? (
            <Card className="mb-4 border-success">
              <Card.Header className="bg-success text-white">
                <h6 className="mb-0">Itens da Requisição ({formData.itens.length})</h6>
              </Card.Header>
              <Card.Body>
                <Table striped bordered hover>
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
                      return (
                        <tr key={index}>
                          <td>{medicamento?.principioAtivo} {medicamento?.concentracao}</td>
                          <td><strong>{item.quantidadeSolicitada}</strong></td>
                          <td>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => removerItem(index)}
                              type="button"
                            >
                              Remover
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          ) : (
            <Alert variant="warning" className="mb-4">
              <strong>Atenção:</strong> Nenhum medicamento adicionado. Adicione pelo menos um item para continuar.
            </Alert>
          )}

          <Alert variant="info">
            <strong>💡 Como funciona:</strong> Esta requisição será enviada para o almoxarifado
            selecionado, que poderá aprovar, reprovar ou atender parcialmente os itens solicitados.
          </Alert>

          {/* Botões */}
          <div className="d-flex justify-content-end gap-2">
            <Button
              variant="secondary"
              onClick={onCancel}
              disabled={isLoading || isSubmitting}
              type="button"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isLoading || isSubmitting || formData.itens.length === 0 || !formData.atendenteId}
            >
              {isLoading || isSubmitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Enviando...
                </>
              ) : (
                'Enviar Requisição'
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default NovaRequisicaoForm;