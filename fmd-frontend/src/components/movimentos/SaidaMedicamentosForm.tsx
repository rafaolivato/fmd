// src/components/movimentos/SaidaMedicamentosForm.tsx
import React, { useState, useEffect } from 'react'; // <-- Adicionado useEffect
import { Button, Card, Form, Row, Col, Table, Alert } from 'react-bootstrap';
import type { MovimentoSaidaFormData, ItemMovimentoSaida } from '../../types/MovimentoSaida';
import type { Medicamento } from '../../types/Medicamento';
import type { Estabelecimento } from '../../types/Estabelecimento';
import { estoqueService } from '../../store/services/estoqueService';

interface SaidaMedicamentosFormProps {
  estabelecimentos: Estabelecimento[]; // Deve vir com apenas 1 item (o do usuário)
  medicamentos: Medicamento[];
  onSubmit: (data: MovimentoSaidaFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const SaidaMedicamentosForm: React.FC<SaidaMedicamentosFormProps> = ({
  estabelecimentos,
  medicamentos,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  
  // 🚨 DICA: Pegamos o ID e Nome do estabelecimento logo na primeira renderização
  const estabelecimentoLogado = estabelecimentos.length > 0 ? estabelecimentos[0] : null;
  const estabelecimentoIdInicial = estabelecimentoLogado ? estabelecimentoLogado.id : '';

  const [formData, setFormData] = useState<MovimentoSaidaFormData>({
    estabelecimentoId: estabelecimentoIdInicial, // <-- Inicializado com o ID do estabelecimento
    tipoMovimentacao: 'SAIDA',
    documentoReferencia: '',
    dataMovimento: new Date().toISOString().split('T')[0],
    justificativa: '',
    observacao: '',
    itens: []
  });

  const [novoItem, setNovoItem] = useState<ItemMovimentoSaida>({
    medicamentoId: '',
    quantidadeSaida: 0
  });

  const [estoqueDisponivel, setEstoqueDisponivel] = useState<number>(0);

  // 🚨 NOVO: Atualiza o formData caso as props de estabelecimentos mudem
  // Embora você tenha resolvido isso na página, é uma garantia
  useEffect(() => {
      if (estabelecimentoLogado && formData.estabelecimentoId !== estabelecimentoLogado.id) {
          setFormData(prev => ({ 
              ...prev, 
              estabelecimentoId: estabelecimentoLogado.id 
          }));
      }
  }, [estabelecimentoLogado]);


  // ❌ REMOVIDA: A função handleEstabelecimentoChange não é mais necessária

  // Função para quando mudar o medicamento
  const handleMedicamentoChange = async (medicamentoId: string) => {
    setNovoItem(prev => ({ 
      ...prev, 
      medicamentoId,
      quantidadeSaida: 0
    }));
    
    // Agora só usa o formData.estabelecimentoId (que está inicializado)
    if (medicamentoId && formData.estabelecimentoId) {
      try {
        const estoque = await estoqueService.getEstoqueMedicamento(
          medicamentoId, 
          formData.estabelecimentoId
        );
        setEstoqueDisponivel(estoque);
      } catch (error) {
        console.error('Erro ao buscar estoque:', error);
        setEstoqueDisponivel(0);
      }
    } else {
      setEstoqueDisponivel(0);
    }
  };

  const adicionarItem = () => {
    // ... (Lógica de adicionar item permanece a mesma)
    if (!novoItem.medicamentoId || novoItem.quantidadeSaida <= 0) {
      alert('Selecione um medicamento e informe a quantidade');
      return;
    }

    if (novoItem.quantidadeSaida > estoqueDisponivel) {
      alert(`Quantidade solicitada (${novoItem.quantidadeSaida}) excede o estoque disponível (${estoqueDisponivel})`);
      return;
    }

    setFormData(prev => ({
      ...prev,
      itens: [...prev.itens, { ...novoItem }]
    }));

    // Reset novo item
    setNovoItem({
      medicamentoId: '',
      quantidadeSaida: 0
    });
    setEstoqueDisponivel(0);
  };

  const removerItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      itens: prev.itens.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // ... (Validações existentes)

    // 🚨 NOVA VALIDAÇÃO: Garante que o estabelecimento está preenchido
    if (!formData.estabelecimentoId) {
        alert('Erro interno: ID do estabelecimento não definido. Recarregue a página.');
        return;
    }

    onSubmit(formData);
  };

  // 🚨 NOVO: Se o estabelecimento não for carregado, mostra um erro claro
  if (!estabelecimentoLogado) {
    return (
        <Alert variant="danger" className="p-4">
            Não foi possível carregar o estabelecimento do usuário. Por favor, recarregue a página ou entre em contato com o suporte.
        </Alert>
    );
  }

  return (
    <Card>
      <Card.Header>
        <h5 className="card-title mb-0 fw-bold">Saída de Medicamentos</h5>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          {/* Dados do Movimento */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Estabelecimento *</Form.Label>
                
                {/* 🚨 NOVO: Campo não editável que mostra o nome do estabelecimento */}
                <Form.Control
                  type="text"
                  value={estabelecimentoLogado.nome}
                  disabled
                  readOnly
                />
                {/* O ID do estabelecimento já está no formData.estabelecimentoId */}
              </Form.Group>
            </Col>
            <Col md={6}>
            {/* O restante dos campos do cabeçalho do formulário... */}
              <Form.Group>
                <Form.Label>Documento de Referência *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.documentoReferencia}
                  onChange={(e) => setFormData(prev => ({ ...prev, documentoReferencia: e.target.value }))}
                  placeholder="Ex: Requisição nº 001"
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          {/* ... O restante do formulário (Data, Tipo de Saída, Justificativa, Adicionar Itens) permanece o mesmo. */}
          {/* Certifique-se de que a lógica handleMedicamentoChange está usando o ID correto, o que ela está fazendo. */}
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Data da Saída *</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.dataMovimento}
                  onChange={(e) => setFormData(prev => ({ ...prev, dataMovimento: e.target.value }))}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Tipo de Saída</Form.Label>
                <Form.Select
                  value={formData.tipoMovimentacao}
                  onChange={(e) => setFormData(prev => ({ ...prev, tipoMovimentacao: e.target.value }))}
                >
                  <option value="SAIDA">Vencido</option>
                  <option value="PERDA">Perda</option>
                  <option value="TRANSFERENCIA">Transferência</option>
                  <option value="DOAÇÃO">Doação</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Justificativa */}
          <Form.Group className="mb-4">
            <Form.Label>Justificativa da Saída *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.justificativa}
              onChange={(e) => setFormData(prev => ({ ...prev, justificativa: e.target.value }))}
              placeholder="Descreva o motivo da saída dos medicamentos..."
              required
            />
          </Form.Group>

          {/* Adicionar Itens */}
          <Card className="mb-4">
            <Card.Header>
              <h6 className="mb-0">Medicamentos para Saída</h6>
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
                          {med.principioAtivo} - {med.concentracao}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Quantidade *</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      // Mantido o max para a validação visual
                      max={estoqueDisponivel > 0 ? estoqueDisponivel : 1}
                      value={novoItem.quantidadeSaida}
                      onChange={(e) => setNovoItem(prev => ({ ...prev, quantidadeSaida: Number(e.target.value) }))}
                      disabled={estoqueDisponivel === 0}
                    />
                  </Form.Group>
                </Col>
                <Col md={4} className="d-flex align-items-end">
                  <div className="w-100">
                    {novoItem.medicamentoId && (
                      <Alert variant="info" className="py-2 mb-2">
                        <small>Estoque disponível: <strong>{estoqueDisponivel}</strong></small>
                      </Alert>
                    )}
                    <Button variant="primary" onClick={adicionarItem} className="w-100">
                      Adicionar Item
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Itens Adicionados (Continua o mesmo) */}
          {formData.itens.length > 0 && (
            <Card className="mb-4">
              <Card.Header>
                <h6 className="mb-0">Itens da Saída ({formData.itens.length})</h6>
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
                          <td>{item.quantidadeSaida}</td>
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

          {/* Botões */}
          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              variant="warning"
              type="submit"
              disabled={isLoading || formData.itens.length === 0 || !formData.justificativa.trim()}
            >
              {isLoading ? 'Registrando...' : 'Registrar Saída'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default SaidaMedicamentosForm;