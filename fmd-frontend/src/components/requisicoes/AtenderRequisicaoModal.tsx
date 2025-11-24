import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Table, Alert, Badge } from 'react-bootstrap';
import type { Requisicao, ItemRequisicaoAtendimento } from '../../types/Requisicao';
import type { EstoqueLote } from '../../types/Estoque';
import { requisicaoService } from '../../store/services/requisicaoService';
import { estoqueService } from '../../store/services/estoqueService';
import { FaCheck, FaTimes, FaBoxOpen } from 'react-icons/fa';

interface AtenderRequisicaoModalProps {
  requisicao: Requisicao;
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
}

interface LoteSelecionado {
  loteId: string;
  numeroLote: string;
  dataValidade: string;
  quantidadeDisponivel: number;
  quantidadeSelecionada: number;
}

interface ItemComLotes extends ItemRequisicaoAtendimento {
  lotesSelecionados?: LoteSelecionado[];
  showLotesModal?: boolean;
  lotesDisponiveis?: EstoqueLote[];
}

const AtenderRequisicaoModal: React.FC<AtenderRequisicaoModalProps> = ({
  requisicao,
  show,
  onHide,
  onSuccess
}) => {
  const [itensAtendimento, setItensAtendimento] = useState<ItemComLotes[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingLotes, setLoadingLotes] = useState<string | null>(null);

  // ✅ FUNÇÃO CALCULAR DIFERENÇA
  const calcularDiferenca = (itemId: string): number => {
    const itemOriginal = getItemOriginal(itemId);
    const itemAtendido = itensAtendimento.find(ia => ia.itemId === itemId);

    if (!itemOriginal || !itemAtendido) return 0;

    return itemAtendido.quantidadeAtendida - itemOriginal.quantidadeSolicitada;
  };

  // ✅ FUNÇÃO GET STATUS ITEM
  const getStatusItem = (itemId: string): 'exato' | 'maior' | 'menor' => {
    const diferenca = calcularDiferenca(itemId);

    if (diferenca === 0) return 'exato';
    if (diferenca > 0) return 'maior';
    return 'menor';
  };

  // Start os itens de atendimento
  useEffect(() => {
    if (requisicao) {
      const itensIniciais: ItemComLotes[] = requisicao.itens.map(item => ({
        itemId: item.id,
        quantidadeAtendida: item.quantidadeSolicitada,
        lotesSelecionados: [],
        showLotesModal: false,
        lotesDisponiveis: []
      }));
      setItensAtendimento(itensIniciais);
      setError('');
    }
  }, [requisicao]);

  const getItemOriginal = (itemId: string) => {
    return requisicao.itens.find(item => item.id === itemId);
  };

  // ✅ CARREGAR LOTES DISPONÍVEIS
  const carregarLotesDisponiveis = async (itemId: string, medicamentoId: string, estabelecimentoId: string) => {
    try {
      console.log('📦 Carregando lotes para:', {
        itemId,
        medicamentoId,
        estabelecimentoId
      });

      const lotes = await estoqueService.getLotesDisponiveis(medicamentoId, estabelecimentoId);

      console.log('✅ Lotes carregados:', lotes);

      setItensAtendimento(prev =>
        prev.map(item =>
          item.itemId === itemId
            ? { ...item, lotesDisponiveis: lotes }
            : item
        )
      );
    } catch (error) {
      console.error('❌ Erro ao carregar lotes:', error);

      // Mesmo em caso de erro, usa dados vazios
      setItensAtendimento(prev =>
        prev.map(item =>
          item.itemId === itemId
            ? { ...item, lotesDisponiveis: [] }
            : item
        )
      );
    }
  };

  // ✅ ABRIR MODAL DE LOTES
  const abrirModalLotes = async (itemId: string) => {
    const itemOriginal = getItemOriginal(itemId);
    if (!itemOriginal) return;

    setLoadingLotes(itemId);

    try {
      await carregarLotesDisponiveis(
        itemId,
        itemOriginal.medicamento.id,
        requisicao.solicitanteId
      );

      setItensAtendimento(prev =>
        prev.map(item =>
          item.itemId === itemId
            ? { ...item, showLotesModal: true }
            : item
        )
      );
    } finally {
      setLoadingLotes(null);
    }
  };

  // ✅ FECHAR MODAL DE LOTES
  const fecharModalLotes = (itemId: string) => {
    setItensAtendimento(prev =>
      prev.map(item =>
        item.itemId === itemId
          ? { ...item, showLotesModal: false }
          : item
      )
    );
  };

  // ✅ ATUALIZAR QUANTIDADE DO LOTE
  const atualizarQuantidadeLote = (itemId: string, loteId: string, quantidade: number) => {
    setItensAtendimento(prev =>
      prev.map(item => {
        if (item.itemId !== itemId) return item;

        const lotesAtualizados = item.lotesSelecionados?.map(lote =>
          lote.loteId === loteId
            ? { ...lote, quantidadeSelecionada: Math.max(0, Math.min(quantidade, lote.quantidadeDisponivel)) }
            : lote
        ) || [];

        // Calcula o total dos lotes selecionados
        const totalLotes = lotesAtualizados.reduce((sum, lote) => sum + lote.quantidadeSelecionada, 0);

        return {
          ...item,
          lotesSelecionados: lotesAtualizados,
          quantidadeAtendida: totalLotes // Sincroniza com o total dos lotes
        };
      })
    );
  };

  // ✅ ADICIONAR LOTE À SELEÇÃO
  const adicionarLoteSelecao = (itemId: string, lote: EstoqueLote) => {
    setItensAtendimento(prev =>
      prev.map(item => {
        if (item.itemId !== itemId) return item;

        const loteJaSelecionado = item.lotesSelecionados?.some(l => l.loteId === lote.id);
        if (loteJaSelecionado) return item;

        const novoLote: LoteSelecionado = {
          loteId: lote.id,
          numeroLote: lote.numeroLote,
          dataValidade: lote.dataValidade,
          quantidadeDisponivel: lote.quantidade,
          quantidadeSelecionada: 0
        };

        const lotesAtualizados = [...(item.lotesSelecionados || []), novoLote];

        return {
          ...item,
          lotesSelecionados: lotesAtualizados
        };
      })
    );
  };

  // ✅ REMOVER LOTE DA SELEÇÃO
  const removerLoteSelecao = (itemId: string, loteId: string) => {
    setItensAtendimento(prev =>
      prev.map(item => {
        if (item.itemId !== itemId) return item;

        const lotesAtualizados = item.lotesSelecionados?.filter(lote => lote.loteId !== loteId) || [];
        const totalLotes = lotesAtualizados.reduce((sum, lote) => sum + lote.quantidadeSelecionada, 0);

        return {
          ...item,
          lotesSelecionados: lotesAtualizados,
          quantidadeAtendida: totalLotes
        };
      })
    );
  };

  // ✅ DISTRIBUIÇÃO AUTOMÁTICA (FIFO)
  const distribuirAutomaticamente = (itemId: string) => {
    setItensAtendimento(prev =>
      prev.map(item => {
        if (item.itemId !== itemId) return item;

        const quantidadeTotal = item.quantidadeAtendida;
        const lotesOrdenados = [...(item.lotesDisponiveis || [])]
          .sort((a, b) => new Date(a.dataValidade).getTime() - new Date(b.dataValidade).getTime());

        let quantidadeRestante = quantidadeTotal;
        const lotesSelecionados: LoteSelecionado[] = [];

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

        return {
          ...item,
          lotesSelecionados,
          quantidadeAtendida: quantidadeTotal - quantidadeRestante
        };
      })
    );
  };

  // ✅ ATUALIZAR QUANTIDADE DO ITEM
  const atualizarQuantidade = (itemId: string, quantidade: number) => {
    setItensAtendimento(prev =>
      prev.map(item => {
        if (item.itemId !== itemId) return item;
        
        // Se for medicamento controlado e tiver lotes selecionados, não permite alterar manualmente
        const itemOriginal = getItemOriginal(itemId);
        const isControlado = itemOriginal?.medicamento.psicotropico;
        
        if (isControlado && item.lotesSelecionados && item.lotesSelecionados.length > 0) {
          // Para controlados, a quantidade é controlada pelos lotes
          return item;
        }
        
        return { 
          ...item, 
          quantidadeAtendida: Math.max(0, quantidade) 
        };
      })
    );
    setError('');
  };

  // ✅ VALIDAR ATENDIMENTO
  const validarAtendimento = (): boolean => {
    // Verifica se todos os itens têm lotes selecionados (para controlados)
    for (const item of itensAtendimento) {
      const itemOriginal = getItemOriginal(item.itemId);

      if (itemOriginal?.medicamento.psicotropico && item.quantidadeAtendida > 0) {
        if (!item.lotesSelecionados || item.lotesSelecionados.length === 0) {
          setError(`Para o medicamento controlado ${itemOriginal.medicamento.principioAtivo}, é necessário selecionar os lotes.`);
          return false;
        }

        // Verifica se a soma dos lotes bate com a quantidade atendida
        const totalLotes = item.lotesSelecionados.reduce((sum, lote) => sum + lote.quantidadeSelecionada, 0);
        if (totalLotes !== item.quantidadeAtendida) {
          setError(`A soma dos lotes (${totalLotes}) não corresponde à quantidade atendida (${item.quantidadeAtendida}) para ${itemOriginal.medicamento.principioAtivo}.`);
          return false;
        }
      }
    }

    const totalAtendido = itensAtendimento.reduce((total, item) => total + item.quantidadeAtendida, 0);
    if (totalAtendido === 0) {
      setError('Pelo menos um item deve ser atendido.');
      return false;
    }

    setError('');
    return true;
  };

  // ✅ ENVIAR ATENDIMENTO
  const handleSubmit = async () => {
    if (!validarAtendimento()) return;

    try {
      setIsLoading(true);

      // Prepara os dados no formato correto para o backend
      const itens = itensAtendimento.map(item => ({
        itemId: item.itemId,
        quantidadeAtendida: item.quantidadeAtendida,
        lotes: item.lotesSelecionados?.map(lote => ({
          loteId: lote.loteId,
          quantidade: lote.quantidadeSelecionada,
          numeroLote: lote.numeroLote
        })) || []
      }));

      console.log('📤 Enviando dados para atendimento:', {
        requisicaoId: requisicao.id,
        itens
      });

      await requisicaoService.atenderRequisicao(requisicao.id, itens);
      onSuccess();
      
    } catch (error: any) {
      console.error('❌ Erro ao atender requisição:', error);
      setError(error.response?.data?.message || 'Erro ao atender requisição');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>
          Atender Requisição #{requisicao.id.substring(0, 8)}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Alert variant="info">
          <strong>💡 Informação:</strong> Para medicamentos controlados, é obrigatório selecionar os lotes específicos.
        </Alert>

        {error && <Alert variant="danger">{error}</Alert>}

        <Table striped bordered>
          <thead>
            <tr>
              <th>Medicamento</th>
              <th>Solicitado</th>
              <th>Atender</th>
              <th>Lotes</th>
              <th>Diferença</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {requisicao.itens.map(item => {
              const itemAtendido = itensAtendimento.find(ia => ia.itemId === item.id);
              const quantidadeAtendida = itemAtendido?.quantidadeAtendida || 0;
              const diferenca = calcularDiferenca(item.id);
              const status = getStatusItem(item.id);
              const isControlado = item.medicamento.psicotropico;

              return (
                <tr key={item.id}>
                  <td>
                    <strong>{item.medicamento.principioAtivo}</strong>
                    <br />
                    <small className="text-muted">{item.medicamento.concentracao}</small>
                    {isControlado && (
                      <Badge bg="warning" className="ms-1">Controlado</Badge>
                    )}
                  </td>
                  <td className="text-center">
                    <Badge bg="secondary">{item.quantidadeSolicitada}</Badge>
                  </td>
                  <td style={{ width: '150px' }}>
                    <Form.Control
                      type="number"
                      min="0"
                      value={quantidadeAtendida === 0 ? '' : quantidadeAtendida.toString()}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || /^\d+$/.test(value)) {
                          atualizarQuantidade(item.id, Number(value));
                        }
                      }}
                      placeholder="Quantidade"
                      disabled={isControlado && itemAtendido?.lotesSelecionados && itemAtendido.lotesSelecionados.length > 0}
                      title={isControlado && itemAtendido?.lotesSelecionados && itemAtendido.lotesSelecionados.length > 0 ? 
                        "Para medicamentos controlados, a quantidade é controlada pelos lotes selecionados" : ""}
                    />
                  </td>
                  <td style={{ width: '200px' }}>
                    <div className="d-flex flex-column gap-1">
                      <Button
                        variant={isControlado ? "primary" : "outline-primary"}
                        size="sm"
                        onClick={() => abrirModalLotes(item.id)}
                        disabled={loadingLotes === item.id}
                      >
                        <FaBoxOpen className="me-1" />
                        {loadingLotes === item.id ? 'Carregando...' : 'Selecionar Lotes'}
                        {itemAtendido?.lotesSelecionados && itemAtendido.lotesSelecionados.length > 0 && (
                          <Badge bg="light" text="dark" className="ms-1">
                            {itemAtendido.lotesSelecionados.length}
                          </Badge>
                        )}
                      </Button>

                      {/* Resumo dos lotes selecionados */}
                      {itemAtendido?.lotesSelecionados && itemAtendido.lotesSelecionados.map(lote => (
                        <div key={lote.loteId} className="small text-muted">
                          Lote {lote.numeroLote}: {lote.quantidadeSelecionada}
                        </div>
                      ))}
                    </div>

                    {/* Modal de Seleção de Lotes */}
                    {itemAtendido?.showLotesModal && (
                      <ModalLotes
                        item={item}
                        itemAtendido={itemAtendido}
                        onHide={() => fecharModalLotes(item.id)}
                        onAdicionarLote={(lote) => adicionarLoteSelecao(item.id, lote)}
                        onRemoverLote={(loteId) => removerLoteSelecao(item.id, loteId)}
                        onAtualizarQuantidade={(loteId, quantidade) =>
                          atualizarQuantidadeLote(item.id, loteId, quantidade)
                        }
                        onDistribuirAutomaticamente={() => distribuirAutomaticamente(item.id)}
                      />
                    )}
                  </td>
                  <td className="text-center">
                    {diferenca !== 0 && (
                      <Badge bg={diferenca > 0 ? 'success' : 'warning'}>
                        {diferenca > 0 ? '+' : ''}{diferenca}
                      </Badge>
                    )}
                  </td>
                  <td className="text-center">
                    {status === 'exato' && <Badge bg="success"><FaCheck /> Exato</Badge>}
                    {status === 'maior' && <Badge bg="info"><FaCheck /> Extra</Badge>}
                    {status === 'menor' && <Badge bg="warning"><FaTimes /> Parcial</Badge>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isLoading}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Atendendo...' : 'Confirmar Atendimento'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// Componente Modal de Lotes
const ModalLotes: React.FC<{
  item: any;
  itemAtendido: ItemComLotes;
  onHide: () => void;
  onAdicionarLote: (lote: EstoqueLote) => void;
  onRemoverLote: (loteId: string) => void;
  onAtualizarQuantidade: (loteId: string, quantidade: number) => void;
  onDistribuirAutomaticamente: () => void;
}> = ({ item, itemAtendido, onHide, onAdicionarLote, onRemoverLote, onAtualizarQuantidade, onDistribuirAutomaticamente }) => {

  const totalSelecionado = itemAtendido.lotesSelecionados?.reduce((sum, lote) => sum + lote.quantidadeSelecionada, 0) || 0;
  const hasLotesDisponiveis = itemAtendido.lotesDisponiveis && itemAtendido.lotesDisponiveis.length > 0;

  return (
    <Modal show={true} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          Selecionar Lotes - {item.medicamento.principioAtivo}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="info">
          <strong>Quantidade a atender:</strong> {itemAtendido.quantidadeAtendida} unidades
          <br />
          <strong>Total selecionado:</strong> {totalSelecionado} unidades
          {totalSelecionado !== itemAtendido.quantidadeAtendida && (
            <span className="text-warning"> ⚠️ Não coincide</span>
          )}
        </Alert>

        {!hasLotesDisponiveis ? (
          <Alert variant="warning">
            <strong>⚠️ Nenhum lote disponível</strong>
            <br />
            Não foram encontrados lotes disponíveis para este medicamento.
          </Alert>
        ) : (
          <>
            <div className="mb-3">
              <Button variant="outline-success" size="sm" onClick={onDistribuirAutomaticamente}>
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
                {itemAtendido.lotesDisponiveis?.map(lote => {
                  const loteSelecionado = itemAtendido.lotesSelecionados?.find(l => l.loteId === lote.id);
                  const isSelecionado = !!loteSelecionado;

                  return (
                    <tr key={lote.id}>
                      <td>
                        {!isSelecionado ? (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => onAdicionarLote(lote)}
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
                              onAtualizarQuantidade(lote.id, value);
                            }}
                          />
                        )}
                      </td>
                      <td>
                        {isSelecionado && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => onRemoverLote(lote.id)}
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
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AtenderRequisicaoModal;