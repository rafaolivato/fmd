import React, { useState, useEffect } from 'react';
import { Button, Card, Form, Row, Col, Table, Alert, Modal } from 'react-bootstrap';
import type { MovimentoSaidaFormData, ItemMovimentoSaida } from '../../types/MovimentoSaida';
import type { Medicamento } from '../../types/Medicamento';
import type { Estabelecimento } from '../../types/Estabelecimento';
import type { EstoqueLote } from '../../types/Estoque';

// ✅ IMPORT REAL DO SERVIÇO DE ESTOQUE

import { estoqueService } from '../../store/services/estoqueService';

interface SaidaMedicamentosFormProps {
  estabelecimentos: Estabelecimento[];
  medicamentos: Medicamento[];
  onSubmit: (data: MovimentoSaidaFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

// Interface para os lotes no item
interface ItemComLotes extends ItemMovimentoSaida {
  lotes: Array<{
    loteId: string;
    quantidade: number;
    numeroLote?: string;
    dataValidade?: string;
  }>;
}

const SaidaMedicamentosForm: React.FC<SaidaMedicamentosFormProps> = ({
  estabelecimentos,
  medicamentos,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const estabelecimentoLogado = estabelecimentos.length > 0 ? estabelecimentos[0] : null;
  const estabelecimentoIdInicial = estabelecimentoLogado ? estabelecimentoLogado.id : '';

  const [formData, setFormData] = useState<MovimentoSaidaFormData>({
    estabelecimentoId: estabelecimentoIdInicial,
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
  const [lotesDisponiveis, setLotesDisponiveis] = useState<Lote[]>([]);
  
  // Estado para o modal de seleção de lotes
  const [showModalLotes, setShowModalLotes] = useState(false);
  const [lotesSelecionados, setLotesSelecionados] = useState<Array<{
    loteId: string;
    quantidade: number;
    numeroLote: string;
    dataValidade: string;
    quantidadeMaxima: number;
  }>>([]);

  useEffect(() => {
    if (estabelecimentoLogado && formData.estabelecimentoId !== estabelecimentoLogado.id) {
      setFormData(prev => ({
        ...prev,
        estabelecimentoId: estabelecimentoLogado.id
      }));
    }
  }, [estabelecimentoLogado]);

  // Função para buscar estoque e lotes quando medicamento muda
  const handleMedicamentoChange = async (medicamentoId: string) => {
    setNovoItem(prev => ({
      ...prev,
      medicamentoId,
      quantidadeSaida: 0
    }));

    if (medicamentoId && formData.estabelecimentoId) {
      try {
        // Busca estoque total
        const estoque = await estoqueService.getEstoqueMedicamento(
          medicamentoId,
          formData.estabelecimentoId
        );
        setEstoqueDisponivel(estoque);

        // Busca lotes disponíveis
        const lotes = await estoqueService.getLotesDisponiveis(
          medicamentoId,
          formData.estabelecimentoId
        );
        setLotesDisponiveis(lotes);
      } catch (error) {
        console.error('Erro ao buscar estoque:', error);
        setEstoqueDisponivel(0);
        setLotesDisponiveis([]);
      }
    } else {
      setEstoqueDisponivel(0);
      setLotesDisponiveis([]);
    }
  };

  // Abrir modal para seleção de lotes
  const abrirSelecaoLotes = () => {
    if (!novoItem.medicamentoId || novoItem.quantidadeSaida <= 0) {
      alert('Selecione um medicamento e informe a quantidade antes de selecionar lotes');
      return;
    }

    if (novoItem.quantidadeSaida > estoqueDisponivel) {
      alert(`Quantidade solicitada excede o estoque disponível: ${estoqueDisponivel}`);
      return;
    }

    // Inicializa lotes selecionados
    const lotesIniciais = lotesDisponiveis.map(lote => ({
      loteId: lote.id,
      quantidade: 0,
      numeroLote: lote.numeroLote,
      dataValidade: lote.dataValidade,
      quantidadeMaxima: lote.quantidade
    }));

    setLotesSelecionados(lotesIniciais);
    setShowModalLotes(true);
  };

  // Atualizar quantidade de um lote específico
  const atualizarQuantidadeLote = (loteId: string, quantidade: number) => {
    setLotesSelecionados(prev => 
      prev.map(lote => 
        lote.loteId === loteId 
          ? { ...lote, quantidade: Math.min(Math.max(0, quantidade), lote.quantidadeMaxima) }
          : lote
      )
    );
  };

  // Confirmar seleção de lotes e adicionar item
  const confirmarLotes = () => {
    const totalSelecionado = lotesSelecionados.reduce((sum, lote) => sum + lote.quantidade, 0);
    
    if (totalSelecionado !== novoItem.quantidadeSaida) {
      alert(`A soma das quantidades dos lotes (${totalSelecionado}) deve ser igual à quantidade total (${novoItem.quantidadeSaida})`);
      return;
    }

    // Filtra apenas os lotes com quantidade > 0
    const lotesComQuantidade = lotesSelecionados.filter(lote => lote.quantidade > 0);

    // Adiciona item com os lotes selecionados
    const itemComLotes = {
      ...novoItem,
      lotes: lotesComQuantidade.map(lote => ({
        loteId: lote.loteId,
        quantidade: lote.quantidade,
        numeroLote: lote.numeroLote,
        dataValidade: lote.dataValidade
      }))
    };

    setFormData(prev => ({
      ...prev,
      itens: [...prev.itens, itemComLotes]
    }));

    // Reset estados
    setNovoItem({
      medicamentoId: '',
      quantidadeSaida: 0
    });
    setEstoqueDisponivel(0);
    setLotesDisponiveis([]);
    setShowModalLotes(false);
  };

  const removerItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      itens: prev.itens.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.estabelecimentoId) {
      console.error('Erro interno: ID do estabelecimento não definido.');
      return;
    }

    onSubmit(formData);
  };

  if (!estabelecimentoLogado) {
    return (
      <Alert variant="danger" className="p-4">
        Não foi possível carregar o estabelecimento do usuário.
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
          {/* Dados do Movimento (mantido igual) */}
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
                <Form.Label>Documento de Referência</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.documentoReferencia}
                  onChange={(e) => setFormData(prev => ({ ...prev, documentoReferencia: e.target.value }))}
                  placeholder="Ex: Requisição nº 001 (Opcional - Será gerado se vazio)"
                />
              </Form.Group>
            </Col>
          </Row>

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

          <Form.Group className="mb-4">
            <Form.Label>Justificativa da Saída<span className="text-danger">*</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.justificativa}
              onChange={(e) => setFormData(prev => ({ ...prev, justificativa: e.target.value }))}
              placeholder="Informe o motivo da saída dos medicamentos..."
              required
            />
          </Form.Group>

          {/* Adicionar Itens - ATUALIZADO COM BOTÃO DE LOTES */}
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
                      type="text"
                      value={novoItem.quantidadeSaida === 0 ? '' : novoItem.quantidadeSaida.toString()}
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
                      placeholder={`Máx: ${estoqueDisponivel}`}
                      disabled={estoqueDisponivel === 0}
                      style={{
                        appearance: 'textfield',
                        MozAppearance: 'textfield',
                        WebkitAppearance: 'none'
                      }}
                      onWheel={(e) => e.currentTarget.blur()}
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
                      <Alert variant="info" className="py-2 mb-2">
                        <small>Estoque disponível: <strong>{estoqueDisponivel}</strong></small>
                        <br />
                        <small>Lotes disponíveis: <strong>{lotesDisponiveis.length}</strong></small>
                      </Alert>
                    )}
                    <div className="d-grid gap-2">
                      <Button 
                        variant="outline-primary" 
                        onClick={abrirSelecaoLotes}
                        disabled={!novoItem.medicamentoId || novoItem.quantidadeSaida <= 0}
                      >
                        Selecionar Lotes
                      </Button>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Itens Adicionados - ATUALIZADO PARA MOSTRAR LOTES */}
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
                      <th>Quantidade Total</th>
                      <th>Lotes</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.itens.map((item, index) => {
                      const medicamento = medicamentos.find(m => m.id === item.medicamentoId);
                      const itemComLotes = item as ItemComLotes;
                      
                      return (
                        <tr key={index}>
                          <td>{medicamento?.principioAtivo} {medicamento?.concentracao}</td>
                          <td>{item.quantidadeSaida}</td>
                          <td>
                            {itemComLotes.lotes && itemComLotes.lotes.length > 0 ? (
                              <div>
                                {itemComLotes.lotes.map((lote, loteIndex) => (
                                  <div key={loteIndex} className="small">
                                    <strong>Lote {lote.numeroLote}:</strong> {lote.quantidade} un.
                                    {lote.dataValidade && ` (Val: ${new Date(lote.dataValidade).toLocaleDateString()})`}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted">Lote não especificado</span>
                            )}
                          </td>
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

        {/* Modal de Seleção de Lotes */}
        <Modal show={showModalLotes} onHide={() => setShowModalLotes(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Selecionar Lotes</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              Distribua a quantidade <strong>{novoItem.quantidadeSaida}</strong> entre os lotes disponíveis:
            </p>
            
            <Table striped bordered>
              <thead>
                <tr>
                  <th>Lote</th>
                  <th>Data Validade</th>
                  <th>Estoque Disponível</th>
                  <th>Quantidade a Usar</th>
                </tr>
              </thead>
              <tbody>
                {lotesSelecionados.map((lote) => (
                  <tr key={lote.loteId}>
                    <td>{lote.numeroLote}</td>
                    <td>{new Date(lote.dataValidade).toLocaleDateString()}</td>
                    <td>{lote.quantidadeMaxima}</td>
                    <td>
                      <Form.Control
                        type="number"
                        min="0"
                        max={lote.quantidadeMaxima}
                        value={lote.quantidade}
                        onChange={(e) => atualizarQuantidadeLote(lote.loteId, parseInt(e.target.value) || 0)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <Alert variant="info">
              Total selecionado: <strong>
                {lotesSelecionados.reduce((sum, lote) => sum + lote.quantidade, 0)}
              </strong> / {novoItem.quantidadeSaida}
            </Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModalLotes(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={confirmarLotes}>
              Confirmar Lotes
            </Button>
          </Modal.Footer>
        </Modal>
      </Card.Body>
    </Card>
  );
};

export default SaidaMedicamentosForm;