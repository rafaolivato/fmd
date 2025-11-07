import React, { useState } from 'react';
import { Button, Card, Form, Row, Col, Table } from 'react-bootstrap';
import type { MovimentoEntradaFormData, ItemMovimentoEntrada } from '../../types/MovimentoEntrada';
import type { Medicamento } from '../../types/Medicamento';
import type { Estabelecimento } from '../../types/Estabelecimento';

interface EntradaMedicamentosFormProps {
  estabelecimentos: Estabelecimento[];
  medicamentos: Medicamento[];
  onSubmit: (data: MovimentoEntradaFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const EntradaMedicamentosForm: React.FC<EntradaMedicamentosFormProps> = ({
  estabelecimentos,
  medicamentos,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<MovimentoEntradaFormData>({
    estabelecimentoId: '',
    tipoMovimentacao: 'ENTRADA',
    fonteFinanciamento: '',
    fornecedor: '',
    documentoTipo: 'NOTA_FISCAL',
    numeroDocumento: '',
    dataDocumento: new Date().toISOString().split('T')[0],
    dataRecebimento: new Date().toISOString().split('T')[0],
    valorTotal: 0,
    observacao: '',
    itens: []
  });

  // ✅ CORREÇÃO: Mude quantidade de 0 para 1
  const [novoItem, setNovoItem] = useState<Omit<ItemMovimentoEntrada, 'medicamentoId'> & { medicamentoId: string }>({
    medicamentoId: '',
    valorUnitario: 0,
    fabricante: '',
    numeroLote: '',
    dataValidade: '',
    quantidade: 1, // ✅ Mude de 0 para 1
    localizacaoFisica: ''
  });

  const adicionarItem = () => {
    // ✅ CORREÇÃO: Mude <= para <
    if (!novoItem.medicamentoId || novoItem.quantidade < 1) {
      alert('Selecione um medicamento e informe a quantidade');
      return;
    }

    setFormData(prev => ({
      ...prev,
      itens: [...prev.itens, novoItem as ItemMovimentoEntrada],
      valorTotal: prev.valorTotal + (novoItem.valorUnitario * novoItem.quantidade)
    }));

    // ✅ CORREÇÃO: Reset mantém quantidade como 1
    setNovoItem({
      medicamentoId: '',
      valorUnitario: 0,
      fabricante: '',
      numeroLote: '',
      dataValidade: '',
      quantidade: 1, // ✅ Mude de 0 para 1
      localizacaoFisica: ''
    });
  };

  const removerItem = (index: number) => {
    const item = formData.itens[index];
    setFormData(prev => ({
      ...prev,
      itens: prev.itens.filter((_, i) => i !== index),
      valorTotal: prev.valorTotal - (item.valorUnitario * item.quantidade)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.itens.length === 0) {
      alert('Adicione pelo menos um item ao movimento');
      return;
    }

    onSubmit(formData);
  };

  return (
    <Card>
      <Card.Header>
        <h5 className="card-title mb-0">Entrada de Medicamentos</h5>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          {/* Dados do Movimento */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Estabelecimento *</Form.Label>
                <Form.Select
                  value={formData.estabelecimentoId}
                  onChange={(e) => setFormData(prev => ({ ...prev, estabelecimentoId: e.target.value }))}
                  required
                >
                  <option value="">Selecione...</option>
                  {estabelecimentos.map(est => (
                    <option key={est.id} value={est.id}>{est.nome}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Fornecedor *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.fornecedor}
                  onChange={(e) => setFormData(prev => ({ ...prev, fornecedor: e.target.value }))}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Tipo Documento</Form.Label>
                <Form.Select
                  value={formData.documentoTipo}
                  onChange={(e) => setFormData(prev => ({ ...prev, documentoTipo: e.target.value }))}
                >
                  <option value="NOTA_FISCAL">Nota Fiscal</option>
                  <option value="DOACAO">Doação</option>
                  <option value="TRANSFERENCIA">Transferência</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Número Documento</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.numeroDocumento}
                  onChange={(e) => setFormData(prev => ({ ...prev, numeroDocumento: e.target.value }))}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Fonte Financiamento</Form.Label>
                <Form.Select
                  value={formData.fonteFinanciamento}
                  onChange={(e) => setFormData(prev => ({ ...prev, fonteFinanciamento: e.target.value }))}
                >
                  <option value="">Selecione...</option>
                  <option value="RECURSOS_PRO PRIOS">Recursos Próprios</option>
                  <option value="SUS">SUS</option>
                  <option value="CONVENIO">Convênio</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Adicionar Itens */}
          <Card className="mb-4">
            <Card.Header>
              <h6 className="mb-0">Adicionar Medicamentos</h6>
            </Card.Header>
            <Card.Body>
              <Row className="g-2">
                <Col md={3}>
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
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Quantidade *</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      value={novoItem.quantidade}
                      onChange={(e) => setNovoItem(prev => ({ 
                        ...prev, 
                        quantidade: Math.max(1, Number(e.target.value) || 1) // ✅ Garante mínimo 1
                      }))}
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Lote *</Form.Label>
                    <Form.Control
                      type="text"
                      value={novoItem.numeroLote}
                      onChange={(e) => setNovoItem(prev => ({ ...prev, numeroLote: e.target.value }))}
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Validade *</Form.Label>
                    <Form.Control
                      type="date"
                      value={novoItem.dataValidade}
                      onChange={(e) => setNovoItem(prev => ({ ...prev, dataValidade: e.target.value }))}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Valor Unitário</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={novoItem.valorUnitario}
                      onChange={(e) => setNovoItem(prev => ({ ...prev, valorUnitario: Number(e.target.value) }))}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="g-2 mt-2">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Fabricante</Form.Label>
                    <Form.Control
                      type="text"
                      value={novoItem.fabricante}
                      onChange={(e) => setNovoItem(prev => ({ ...prev, fabricante: e.target.value }))}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Localização</Form.Label>
                    <Form.Control
                      type="text"
                      value={novoItem.localizacaoFisica}
                      onChange={(e) => setNovoItem(prev => ({ ...prev, localizacaoFisica: e.target.value }))}
                    />
                  </Form.Group>
                </Col>
                <Col md={4} className="d-flex align-items-end">
                  <Button variant="primary" onClick={adicionarItem}>
                    Adicionar Item
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Itens Adicionados */}
          {formData.itens.length > 0 && (
            <Card className="mb-4">
              <Card.Header>
                <h6 className="mb-0">Itens do Movimento ({formData.itens.length})</h6>
              </Card.Header>
              <Card.Body>
                <Table striped bordered>
                  <thead>
                    <tr>
                      <th>Medicamento</th>
                      <th>Lote</th>
                      <th>Validade</th>
                      <th>Quantidade</th>
                      <th>Valor Unit.</th>
                      <th>Total</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.itens.map((item, index) => {
                      const medicamento = medicamentos.find(m => m.id === item.medicamentoId);
                      return (
                        <tr key={index}>
                          <td>{medicamento?.principioAtivo} {medicamento?.concentracao}</td>
                          <td>{item.numeroLote}</td>
                          <td>{new Date(item.dataValidade).toLocaleDateString('pt-BR')}</td>
                          <td>{item.quantidade}</td>
                          <td>R$ {item.valorUnitario.toFixed(2)}</td>
                          <td>R$ {(item.valorUnitario * item.quantidade).toFixed(2)}</td>
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
                  <tfoot>
                    <tr>
                      <td colSpan={5} className="text-end fw-bold">Valor Total:</td>
                      <td colSpan={2} className="fw-bold">
                        R$ {formData.valorTotal.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </Table>
              </Card.Body>
            </Card>
          )}

          {/* Observações */}
          <Form.Group className="mb-3">
            <Form.Label>Observações</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.observacao}
              onChange={(e) => setFormData(prev => ({ ...prev, observacao: e.target.value }))}
            />
          </Form.Group>

          {/* Botões */}
          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={isLoading || formData.itens.length === 0}>
              {isLoading ? 'Registrando...' : 'Registrar Entrada'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default EntradaMedicamentosForm;