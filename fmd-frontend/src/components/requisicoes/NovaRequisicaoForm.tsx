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
  usuarioLogado?: { // Torna opcional com ?
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
  // Estado de loading interno enquanto usuarioLogado não carrega
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Quando usuarioLogado chegar, remove o loading
    if (usuarioLogado) {
      setLoading(false);
    }
  }, [usuarioLogado]);

  // Inicializa formData de forma segura
  const [formData, setFormData] = useState<RequisicaoFormData>({
    solicitanteId: usuarioLogado?.estabelecimentoId || '',
    atendenteId: '',
    observacao: '',
    itens: []
  });

  const [novoItem, setNovoItem] = useState<ItemRequisicaoForm>({
    medicamentoId: '',
    quantidadeSolicitada: 1
  });

  // Atualiza formData quando usuarioLogado carregar
  useEffect(() => {
    if (usuarioLogado?.estabelecimentoId) {
      setFormData(prev => ({
        ...prev,
        solicitanteId: usuarioLogado.estabelecimentoId
      }));
    }
  }, [usuarioLogado]);

  // Filtra apenas almoxarifados - CORREÇÃO: uso seguro do tipo
  const almoxarifados = estabelecimentos.filter(est => {
    const estabelecimento = est as any;
    return estabelecimento.tipo && estabelecimento.tipo === 'ALMOXARIFADO';
  });

  const adicionarItem = () => {
    if (!novoItem.medicamentoId || novoItem.quantidadeSolicitada < 1) {
      alert('Selecione um medicamento e informe a quantidade');
      return;
    }

    setFormData(prev => ({
      ...prev,
      itens: [...prev.itens, { ...novoItem }]
    }));

    setNovoItem({
      medicamentoId: '',
      quantidadeSolicitada: 1
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

    if (!formData.atendenteId) {
      alert('Selecione o almoxarifado atendente');
      return;
    }

    if (formData.itens.length === 0) {
      alert('Adicione pelo menos um item à requisição');
      return;
    }

    // Remove o solicitanteId do envio - agora é automático
    const dataParaEnviar = {
      itens: formData.itens,
      observacao: formData.observacao
    };

    onSubmit(dataParaEnviar as any);
  };

  // Loading enquanto usuarioLogado não carrega
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
        <Form onSubmit={handleSubmit}>
          {/* Estabelecimentos - Simplificado */}
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

          {/* Adicionar Itens */}
          <Card className="mb-4">
            <Card.Header>
              <h6 className="mb-0">Medicamentos Solicitados</h6>
            </Card.Header>
            <Card.Body>
              <Row className="g-2">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Medicamento *</Form.Label>
                    <Form.Select
                      value={novoItem.medicamentoId}
                      onChange={(e) => setNovoItem(prev => ({ ...prev, medicamentoId: e.target.value }))}
                    >
                      <option value="">Selecione...</option>
                      {medicamentos.map(med => (
                        <option key={med.id} value={med.id}>
                          {med.principioAtivo}  {med.concentracao}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Quantidade *</Form.Label>
                    <Form.Control
                      type="text" // ✅ Mudei para "text"
                      value={novoItem.quantidadeSolicitada === 0 ? '' : novoItem.quantidadeSolicitada.toString()}
                      onChange={(e) => {
                        const value = e.target.value;

                        // ✅ Permite apenas números e campo vazio
                        if (value === '' || /^\d+$/.test(value)) {
                          const numValue = value === '' ? 0 : Number(value);

                          // ✅ Garante que seja pelo menos 1
                          const quantidadeFinal = Math.max(1, numValue);
                          setNovoItem(prev => ({ ...prev, quantidadeSolicitada: quantidadeFinal }));
                        }
                      }}
                      placeholder="Digite a quantidade"
                      // ✅ Remove completamente as setas do número
                      style={{
                        appearance: 'textfield',
                        MozAppearance: 'textfield',
                        WebkitAppearance: 'none'
                      }}
                      onWheel={(e) => e.currentTarget.blur()} // ✅ Previne scroll do mouse
                    />
                  </Form.Group>
                </Col>
                <Col md={2} className="d-flex align-items-end">
                  <Button variant="primary" onClick={adicionarItem} className="w-100">
                    <FaPlus className="me-2" />
                    Adicionar
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Itens Adicionados */}
          {formData.itens.length > 0 && (
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
          )}

          <Alert variant="info">
            <strong>💡 Como funciona:</strong> Esta requisição será enviada para o almoxarifado
            selecionado, que poderá aprovar, reprovar ou atender parcialmente os itens solicitados.
          </Alert>

          {/* Botões */}
          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
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