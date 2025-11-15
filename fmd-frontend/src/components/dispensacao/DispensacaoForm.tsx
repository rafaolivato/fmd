import React, { useState, useEffect } from 'react';
import { Button, Card, Form, Row, Col, Table, Alert, Modal } from 'react-bootstrap';
import type { DispensacaoFormData, ItemDispensacaoForm } from '../../types/Dispensacao';
import type { Medicamento } from '../../types/Medicamento';
import type { Estabelecimento } from '../../types/Estabelecimento';
import type { Paciente } from '../../types/Paciente';
import { FaPlus, FaSearch, FaExclamationTriangle } from 'react-icons/fa';
import { estoqueService } from '../../store/services/estoqueService';
import { retiradaService } from '../../store/services/retiradaService';

interface DispensacaoFormProps {
  estabelecimentos: Estabelecimento[];
  medicamentos: Medicamento[];
  pacientes: Paciente[];
  onSubmit: (data: DispensacaoFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const DispensacaoForm: React.FC<DispensacaoFormProps> = ({
  estabelecimentos,
  medicamentos,
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
    profissionalSaude: '',
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
  const [showPacienteModal, setShowPacienteModal] = useState(false);
  const [searchCpf, setSearchCpf] = useState('');
  
  // ✅ NOVOS ESTADOS PARA CONTROLE DE RETIRADA ANTECIPADA (ADICIONE APENAS ESTES)
  const [alertasRetirada, setAlertasRetirada] = useState<{[key: string]: string}>({});
  const [showModalJustificativa, setShowModalJustificativa] = useState(false);
  const [justificativaTemp, setJustificativaTemp] = useState('');
  const [medicamentoPendente, setMedicamentoPendente] = useState<string | null>(null);

  useEffect(() => {
    if (estabelecimentoLogado && formData.estabelecimentoOrigemId !== estabelecimentoLogado.id) {
        setFormData(prev => ({ 
            ...prev, 
            estabelecimentoOrigemId: estabelecimentoLogado.id 
        }));
    }
  }, [estabelecimentoLogado]);

  // ✅ 1. ADICIONE ESTA FUNÇÃO (VERIFICAÇÃO DE RETIRADA RECENTE)
  const verificarRetiradaRecente = async (medicamentoId: string) => {
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

  // ✅ 2. MODIFIQUE A handleMedicamentoChange (ADICIONE APENAS ESTA LINHA)
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
        
        // ✅ APENAS ESTA LINHA NOVA - Verifica retirada recente
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

  // ✅ 3. MODIFIQUE A adicionarItem (ADICIONE ESTE BLOCO)
  const adicionarItem = async () => {
    if (!novoItem.medicamentoId || novoItem.quantidadeSaida <= 0) {
      alert('Selecione um medicamento e informe a quantidade');
      return;
    }

    if (novoItem.quantidadeSaida > estoqueDisponivel) {
      alert(`Quantidade solicitada (${novoItem.quantidadeSaida}) excede o estoque disponível (${estoqueDisponivel})`);
      return;
    }

    // ✅ BLOCO NOVO - Verifica se há alerta antes de adicionar
    if (alertasRetirada[novoItem.medicamentoId]) {
      setMedicamentoPendente(novoItem.medicamentoId);
      setShowModalJustificativa(true);
      return; // Não adiciona até justificar
    }

    // ✅ MANTENHA O RESTO DA FUNÇÃO ORIGINAL
    setFormData(prev => ({
      ...prev,
      itens: [...prev.itens, { ...novoItem }]
    }));

    setNovoItem({
      medicamentoId: '',
      quantidadeSaida: 0
    });
    setEstoqueDisponivel(0);
  };

  // ✅ 4. ADICIONE ESTA FUNÇÃO (CONFIRMAÇÃO DE JUSTIFICATIVA)
  const handleConfirmarJustificativa = () => {
    if (!justificativaTemp.trim()) {
      alert('Por favor, informe uma justificativa para a retirada antecipada.');
      return;
    }

    // Adiciona o item com a justificativa
    if (medicamentoPendente && novoItem.medicamentoId === medicamentoPendente) {
      setFormData(prev => ({
        ...prev,
        itens: [...prev.itens, { ...novoItem }],
        justificativaRetiradaAntecipada: justificativaTemp,
        usuarioAutorizador: 'Sistema'
      }));

      // Limpa estados
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

  // ✅ MANTENHA TODAS AS SUAS FUNÇÕES ORIGINAIS (NÃO MUDE):
  const handleSearchPaciente = () => {
    const pacienteEncontrado = pacientes.find(p => p.cpf === searchCpf);
    if (pacienteEncontrado) {
      setFormData(prev => ({
        ...prev,
        pacienteNome: pacienteEncontrado.nome,
        pacienteCpf: pacienteEncontrado.cpf
      }));
      setShowPacienteModal(false);
    } else {
      alert('Paciente não encontrado. Cadastre um novo paciente.');
    }
  };

  const removerItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      itens: prev.itens.filter((_, i) => i !== index)
    }));
  };

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

    onSubmit(formData);
  };

  // ✅ 5. ADICIONE ESTE useEffect PARA VERIFICAR ITENS EXISTENTES
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
          {/* 🚨 CORREÇÃO: Aplica negrito (fw-bold) no título */}
          <h5 className="card-title mb-0 fw-bold">Dispensação de Medicamentos</h5> 
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            {/* Dados do Paciente (permanece o mesmo) */}
            <Card className="mb-4">
              <Card.Header>
                <h6 className="mb-0">Dados do Paciente</h6>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Nome do Paciente *</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.pacienteNome}
                        onChange={(e) => setFormData(prev => ({ ...prev, pacienteNome: e.target.value }))}
                        placeholder="Nome completo do paciente"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>CPF</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.pacienteCpf}
                        onChange={(e) => setFormData(prev => ({ ...prev, pacienteCpf: e.target.value }))}
                        placeholder="000.000.000-00"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2} className="d-flex align-items-end">
                    <Button 
                      variant="outline-primary" 
                      onClick={() => setShowPacienteModal(true)}
                      className="w-100"
                    >
                      <FaSearch className="me-2" />
                      Buscar
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Dados da Dispensação */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Estabelecimento *</Form.Label>
                  {/* 🚨 CORREÇÃO: Substituído o Form.Select por um Form.Control desabilitado */}
                  <Form.Control
                    type="text"
                    value={estabelecimentoLogado.nome}
                    disabled
                    readOnly
                  />
                  {/* O ID está no estado formData.estabelecimentoOrigemId */}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Documento de Referência *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.documentoReferencia}
                    onChange={(e) => setFormData(prev => ({ ...prev, documentoReferencia: e.target.value }))}
                    placeholder="Nº do receituário, prontuário..."
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Profissional de Saúde</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.profissionalSaude}
                    onChange={(e) => setFormData(prev => ({ ...prev, profissionalSaude: e.target.value }))}
                    placeholder="Nome do médico/dentista..."
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
                <h6 className="mb-0">Medicamentos para Dispensação</h6>
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
                        max={Math.max(1, estoqueDisponivel)}
                        value={novoItem.quantidadeSaida}
                        onChange={(e) => setNovoItem(prev => ({ ...prev, quantidadeSaida: Number(e.target.value) }))}
                        disabled={estoqueDisponivel === 0}
                      />
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

      {/* Modal de Busca de Paciente */}
      <Modal show={showPacienteModal} onHide={() => setShowPacienteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Buscar Paciente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Digite o CPF do paciente</Form.Label>
            <Form.Control
              type="text"
              value={searchCpf}
              onChange={(e) => setSearchCpf(e.target.value)}
              placeholder="000.000.000-00"
            />
          </Form.Group>
          <div className="mt-3">
            <h6>Pacientes Cadastrados:</h6>
            {pacientes.slice(0, 5).map(paciente => (
              <div key={paciente.id} className="border p-2 mb-2 rounded">
                <div><strong>{paciente.nome}</strong></div>
                <small className="text-muted">CPF: {paciente.cpf}</small>
                <Button
                  size="sm"
                  variant="outline-primary"
                  className="ms-2"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      pacienteNome: paciente.nome,
                      pacienteCpf: paciente.cpf
                    }));
                    setShowPacienteModal(false);
                  }}
                >
                  Selecionar
                </Button>
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPacienteModal(false)}>
            Fechar
          </Button>
          <Button variant="primary" onClick={handleSearchPaciente}>
            <FaSearch className="me-2" />
            Buscar
          </Button>
        </Modal.Footer>
      </Modal>


      {/* ✅ 7. ADICIONE ESTE NOVO MODAL PARA JUSTIFICATIVA */}
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
    </>
  );
};

export default DispensacaoForm;