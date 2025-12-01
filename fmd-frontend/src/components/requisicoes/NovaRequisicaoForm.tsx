import React, { useState, useEffect } from 'react';
import { Button, Card, Form, Row, Col, Table, Alert, Spinner } from 'react-bootstrap';
import type { RequisicaoFormData, ItemRequisicaoForm } from '../../types/Requisicao';
import type { Medicamento } from '../../types/Medicamento';
import type { Estabelecimento } from '../../types/Estabelecimento';
import { FaPlus, FaStore } from 'react-icons/fa';

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
  const [formSubmitted, setFormSubmitted] = useState(false); // Adicione este estado

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
    if (!novoItem.medicamentoId || novoItem.quantidadeSolicitada <= 0) { // Alterado para <= 0
      alert('Selecione um medicamento e informe uma quantidade válida (maior que zero)');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true); // Marca que o formulário foi submetido

    // Validações
    if (!formData.atendenteId) {
      alert('Selecione o almoxarifado atendente');
      setFormSubmitted(false); // Reseta se falhar
      return;
    }

    if (formData.itens.length === 0) {
      alert('Adicione pelo menos um item à requisição');
      setFormSubmitted(false);
      return;
    }

    // Prepara os dados para envio
    const dataParaEnviar: RequisicaoFormData = {
      ...formData,
      itens: formData.itens.map(item => ({
        ...item,
        quantidadeSolicitada: Number(item.quantidadeSolicitada)
      }))
    };

    console.log('Enviando requisição:', dataParaEnviar); // Para debug
    onSubmit(dataParaEnviar);
  };

  // Adicione esta função para lidar com a tecla Enter no campo de quantidade
  const handleQuantidadeKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      adicionarItem();
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
        <Form onSubmit={handleSubmit} id="requisicao-form"> {/* Adicionado ID */}
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
              <Form.Group controlId="atendenteId">
                <Form.Label>Almoxarifado Atendente *</Form.Label>
                <Form.Select
                  value={formData.atendenteId}
                  onChange={(e) => setFormData(prev => ({ ...prev, atendenteId: e.target.value }))}
                  required
                  isInvalid={formSubmitted && !formData.atendenteId}
                >
                  <option value="">Selecione o almoxarifado...</option>
                  {almoxarifados.map(est => (
                    <option key={est.id} value={est.id}>{est.nome}</option>
                  ))}
                </Form.Select>
                {formSubmitted && !formData.atendenteId && (
                  <Form.Control.Feedback type="invalid">
                    Selecione um almoxarifado atendente
                  </Form.Control.Feedback>
                )}
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

          {/* Adicionar Itens */}
          <Card className="mb-4">
            <Card.Header>
              <h6 className="mb-0">Medicamentos Solicitados</h6>
            </Card.Header>
            <Card.Body>
              <Row className="g-2">
                <Col md={6}>
                  <Form.Group controlId="medicamentoId">
                    <Form.Label>Medicamento *</Form.Label>
                    <Form.Select
                      value={novoItem.medicamentoId}
                      onChange={(e) => setNovoItem(prev => ({ ...prev, medicamentoId: e.target.value }))}
                      isInvalid={formSubmitted && !novoItem.medicamentoId}
                    >
                      <option value="">Selecione...</option>
                      {medicamentos.map(med => (
                        <option key={med.id} value={med.id}>
                          {med.principioAtivo} {med.concentracao}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="quantidadeSolicitada">
                    <Form.Label>Quantidade *</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      step="1"
                      value={novoItem.quantidadeSolicitada || ''}
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
                      }}
                      onKeyPress={handleQuantidadeKeyPress} 
                      placeholder="Digite a quantidade"
                      
                    />
                    {novoItem.quantidadeSolicitada <= 0 && (
                      <Form.Text className="text-danger">
                        A quantidade deve ser maior que zero
                      </Form.Text>
                    )}
                  </Form.Group>
                </Col>
                <Col md={2} className="d-flex align-items-end">
                  <Button 
                    variant="primary" 
                    onClick={adicionarItem} 
                    className="w-100"
                    type="button" // IMPORTANTE: Adicione type="button"
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
            <Card className="mb-4">
              <Card.Header>
                <h6 className="mb-0">Itens da Requisição ({formData.itens.length})</h6>
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
                      return (
                        <tr key={index}>
                          <td>{medicamento?.principioAtivo} {medicamento?.concentracao}</td>
                          <td>{item.quantidadeSolicitada}</td>
                          <td>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => removerItem(index)}
                              type="button" // IMPORTANTE: Adicione type="button"
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
            formSubmitted && (
              <Alert variant="warning">
                Você precisa adicionar pelo menos um item à requisição.
              </Alert>
            )
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
              disabled={isLoading}
              type="button" // IMPORTANTE: Adicione type="button"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isLoading || formData.itens.length === 0}
            >
              {isLoading ? 'Enviando...' : 'Enviar Requisição'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default NovaRequisicaoForm;