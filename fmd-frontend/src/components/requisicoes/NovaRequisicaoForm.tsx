import React, { useState } from 'react';
import { Button, Card, Form, Row, Col, Table, Alert } from 'react-bootstrap';
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
}

const NovaRequisicaoForm: React.FC<NovaRequisicaoFormProps> = ({
  estabelecimentos,
  medicamentos,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<RequisicaoFormData>({
    solicitanteId: '',
    atendenteId: '',
    observacao: '',
    itens: []
  });

  const [novoItem, setNovoItem] = useState<ItemRequisicaoForm>({
    medicamentoId: '',
    quantidadeSolicitada: 0
  });

  const adicionarItem = () => {
    if (!novoItem.medicamentoId || novoItem.quantidadeSolicitada <= 0) {
      alert('Selecione um medicamento e informe a quantidade');
      return;
    }

    setFormData(prev => ({
      ...prev,
      itens: [...prev.itens, { ...novoItem }]
    }));

    // Reset novo item
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
    
    if (!formData.solicitanteId || !formData.atendenteId) {
      alert('Selecione o solicitante e o atendente');
      return;
    }

    if (formData.solicitanteId === formData.atendenteId) {
      alert('Solicitante e atendente não podem ser o mesmo estabelecimento');
      return;
    }

    if (formData.itens.length === 0) {
      alert('Adicione pelo menos um item à requisição');
      return;
    }

    onSubmit(formData);
  };

  const medicamentoSelecionado = medicamentos.find(m => m.id === novoItem.medicamentoId);

  return (
    <Card>
      <Card.Header>
        <h5 className="card-title mb-0">
          <FaStore className="me-2" />
          Nova Requisição entre Estabelecimentos
        </h5>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          {/* Estabelecimentos */}
          <Row className="mb-4">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Solicitante (Quem precisa) *</Form.Label>
                <Form.Select
                  value={formData.solicitanteId}
                  onChange={(e) => setFormData(prev => ({ ...prev, solicitanteId: e.target.value }))}
                  required
                >
                  <option value="">Selecione o solicitante...</option>
                  {estabelecimentos.map(est => (
                    <option key={est.id} value={est.id}>{est.nome}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Atendente (Quem fornece) *</Form.Label>
                <Form.Select
                  value={formData.atendenteId}
                  onChange={(e) => setFormData(prev => ({ ...prev, atendenteId: e.target.value }))}
                  required
                >
                  <option value="">Selecione o atendente...</option>
                  {estabelecimentos.map(est => (
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
                          {med.principioAtivo} - {med.concentracao}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Quantidade *</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      value={novoItem.quantidadeSolicitada}
                      onChange={(e) => setNovoItem(prev => ({ ...prev, quantidadeSolicitada: Number(e.target.value) }))}
                    />
                  </Form.Group>
                </Col>
                <Col md={2} className="d-flex align-items-end">
                  <Button variant="primary" onClick={adicionarItem} className="w-100">
                    <FaPlus className="me-2" />
                    Add
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
            <strong>💡 Como funciona:</strong> Esta requisição será enviada para o estabelecimento 
            atendente, que poderá aprovar, reprovar ou atender parcialmente os itens solicitados.
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