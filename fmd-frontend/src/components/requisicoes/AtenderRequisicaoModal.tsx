import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Table, Alert, Badge } from 'react-bootstrap';
import type { Requisicao, ItemRequisicaoAtendimento } from '../../types/Requisicao';
import { requisicaoService } from '../../store/services/requisicaoService';
import { FaCheck, FaTimes } from 'react-icons/fa';

interface AtenderRequisicaoModalProps {
  requisicao: Requisicao;
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
}

const AtenderRequisicaoModal: React.FC<AtenderRequisicaoModalProps> = ({
  requisicao,
  show,
  onHide,
  onSuccess
}) => {
  const [itensAtendimento, setItensAtendimento] = useState<ItemRequisicaoAtendimento[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Inicializa os itens de atendimento
  useEffect(() => {
    if (requisicao) {
      const itensIniciais: ItemRequisicaoAtendimento[] = requisicao.itens.map(item => ({
        itemId: item.id,
        quantidadeAtendida: item.quantidadeSolicitada // Começa com a quantidade solicitada
      }));
      setItensAtendimento(itensIniciais);
      setError('');
    }
  }, [requisicao]);

  const getItemOriginal = (itemId: string) => {
    return requisicao.itens.find(item => item.id === itemId);
  };

  const atualizarQuantidade = (itemId: string, quantidade: number) => {
    setItensAtendimento(prev => 
      prev.map(item => 
        item.itemId === itemId 
          ? { ...item, quantidadeAtendida: Math.max(0, quantidade) } // Não permite negativo
          : item
      )
    );
    setError(''); // Limpa erro ao modificar
  };

  const validarAtendimento = (): boolean => {
    // Verifica se há pelo menos um item sendo atendido
    const totalAtendido = itensAtendimento.reduce((total, item) => total + item.quantidadeAtendida, 0);
    
    if (totalAtendido === 0) {
      setError('Pelo menos um item deve ser atendido. Se deseja cancelar, use a opção de cancelamento.');
      return false;
    }

    // Verifica se há quantidades negativas (não deve acontecer devido ao Math.max, mas é uma segurança)
    for (const item of itensAtendimento) {
      if (item.quantidadeAtendida < 0) {
        setError('A quantidade atendida não pode ser negativa');
        return false;
      }
    }

    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validarAtendimento()) return;

    try {
      setIsLoading(true);
      await requisicaoService.atenderRequisicao(requisicao.id, itensAtendimento);
      onSuccess();
    } catch (error: any) {
      console.error('Erro ao atender requisição:', error);
      setError(error.response?.data?.message || 'Erro ao atender requisição');
    } finally {
      setIsLoading(false);
    }
  };

  const calcularDiferenca = (itemId: string): number => {
    const itemOriginal = getItemOriginal(itemId);
    const itemAtendido = itensAtendimento.find(item => item.itemId === itemId);
    
    if (!itemOriginal || !itemAtendido) return 0;
    
    return itemAtendido.quantidadeAtendida - itemOriginal.quantidadeSolicitada;
  };

  const getStatusItem = (itemId: string): string => {
    const diferenca = calcularDiferenca(itemId);
    
    if (diferenca === 0) return 'exato';
    if (diferenca > 0) return 'maior';
    return 'menor';
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          Atender Requisição #{requisicao.id.substring(0, 8)}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <Alert variant="info">
          <strong>💡 Informação:</strong> Você pode enviar uma quantidade maior ou menor 
          do que foi solicitado, conforme a disponibilidade do estoque.
        </Alert>

        {error && <Alert variant="danger">{error}</Alert>}

        <Table striped bordered>
          <thead>
            <tr>
              <th>Medicamento</th>
              <th>Solicitado</th>
              <th>Atender</th>
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

              return (
                <tr key={item.id}>
                  <td>
                    <strong>{item.medicamento.principioAtivo}</strong>
                    <br />
                    <small className="text-muted">{item.medicamento.concentracao}</small>
                  </td>
                  <td className="text-center">
                    <Badge bg="secondary">{item.quantidadeSolicitada}</Badge>
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      min="0"
                      value={quantidadeAtendida}
                      onChange={(e) => atualizarQuantidade(item.id, Number(e.target.value))}
                      style={{ width: '100px' }}
                    />
                  </td>
                  <td className="text-center">
                    {diferenca !== 0 && (
                      <Badge 
                        bg={diferenca > 0 ? 'success' : 'warning'}
                      >
                        {diferenca > 0 ? '+' : ''}{diferenca}
                      </Badge>
                    )}
                  </td>
                  <td className="text-center">
                    {status === 'exato' && (
                      <Badge bg="success">
                        <FaCheck /> Exato
                      </Badge>
                    )}
                    {status === 'maior' && (
                      <Badge bg="info">
                        <FaCheck /> Extra
                      </Badge>
                    )}
                    {status === 'menor' && (
                      <Badge bg="warning">
                        <FaTimes /> Parcial
                      </Badge>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>

        <div className="mt-3 p-3 bg-light rounded">
          <h6>Resumo do Atendimento:</h6>
          <ul className="mb-0">
            <li>
              <Badge bg="success">Exato</Badge> = Quantidade igual à solicitada
            </li>
            <li>
              <Badge bg="info">Extra</Badge> = Quantidade maior que a solicitada
            </li>
            <li>
              <Badge bg="warning">Parcial</Badge> = Quantidade menor que a solicitada
            </li>
          </ul>
        </div>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isLoading}>
          Cancelar
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? 'Atendendo...' : 'Confirmar Atendimento'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AtenderRequisicaoModal;