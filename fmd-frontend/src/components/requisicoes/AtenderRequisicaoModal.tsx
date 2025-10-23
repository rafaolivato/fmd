import React, { useState, useEffect } from 'react';
import { Modal, Table, Form, Button, Alert, Row, Col, Badge } from 'react-bootstrap';
import type { Requisicao, ItemRequisicaoAtendimento } from '../../types/Requisicao';
import { requisicaoService } from '../../store/services/requisicaoService';
import { FaCheck, FaTimes, FaExclamationTriangle , FaHandshake} from 'react-icons/fa';
import ProgressBar from 'react-bootstrap/ProgressBar';

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
  const [error, setError] = useState<string>('');

  // Inicializa os itens de atendimento
  useEffect(() => {
    if (requisicao) {
      const itensIniciais = requisicao.itens.map(item => ({
        itemId: item.id,
        quantidadeAtendida: item.quantidadeAtendida // Mantém o que já foi atendido
      }));
      setItensAtendimento(itensIniciais);
    }
  }, [requisicao]);

  const handleQuantidadeChange = (itemId: string, quantidade: number) => {
    setItensAtendimento(prev => 
      prev.map(item => 
        item.itemId === itemId 
          ? { ...item, quantidadeAtendida: Math.max(0, quantidade) }
          : item
      )
    );
  };

  const getItemOriginal = (itemId: string) => {
    return requisicao.itens.find(item => item.id === itemId);
  };

  const validarAtendimento = (): boolean => {
    for (const item of itensAtendimento) {
      const itemOriginal = getItemOriginal(item.itemId);
      if (!itemOriginal) continue;

      if (item.quantidadeAtendida > itemOriginal.quantidadeSolicitada) {
        setError(`A quantidade atendida não pode ser maior que a solicitada para ${itemOriginal.medicamento.principioAtivo}`);
        return false;
      }

      if (item.quantidadeAtendida < 0) {
        setError('A quantidade atendida não pode ser negativa');
        return false;
      }
    }

    const totalAtendido = itensAtendimento.reduce((total, item) => total + item.quantidadeAtendida, 0);
    if (totalAtendido === 0) {
      setError('Pelo menos um item deve ser atendido. Se deseja cancelar, use a opção de cancelamento.');
      return false;
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

  const getQuantidadeMaxima = (itemId: string) => {
    const itemOriginal = getItemOriginal(itemId);
    return itemOriginal ? itemOriginal.quantidadeSolicitada : 0;
  };

  const getQuantidadeJaAtendida = (itemId: string) => {
    const itemOriginal = getItemOriginal(itemId);
    return itemOriginal ? itemOriginal.quantidadeAtendida : 0;
  };

  const getQuantidadeDisponivel = (itemId: string) => {
    const itemOriginal = getItemOriginal(itemId);
    if (!itemOriginal) return 0;
    return itemOriginal.quantidadeSolicitada - itemOriginal.quantidadeAtendida;
  };

  const getTotalSolicitado = () => {
    return requisicao.itens.reduce((total, item) => total + item.quantidadeSolicitada, 0);
  };

  const getTotalAtendendo = () => {
    return itensAtendimento.reduce((total, item) => total + item.quantidadeAtendida, 0);
  };

  const getTotalJaAtendido = () => {
    return requisicao.itens.reduce((total, item) => total + item.quantidadeAtendida, 0);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <FaHandshake className="me-2" />
          Atender Requisição #{requisicao.id.substring(0, 8)}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="info" className="mb-4">
          <FaExclamationTriangle className="me-2" />
          <strong>Informações da Requisição:</strong>
          <div className="mt-2">
            <strong>Solicitante:</strong> {requisicao.solicitante.nome}<br />
            <strong>Itens solicitados:</strong> {requisicao.itens.length}<br />
            <strong>Total solicitado:</strong> {getTotalSolicitado()} unidades<br />
            <strong>Já atendido:</strong> {getTotalJaAtendido()} unidades
          </div>
        </Alert>

        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        <h6 className="mb-3">Definir Quantidades a Atender</h6>
        <Table striped bordered>
          <thead>
            <tr>
              <th>Medicamento</th>
              <th>Solicitado</th>
              <th>Já Atendido</th>
              <th>Disponível</th>
              <th>Quantidade a Atender</th>
            </tr>
          </thead>
          <tbody>
            {requisicao.itens.map((item) => {
              const itemAtendimento = itensAtendimento.find(ia => ia.itemId === item.id);
              const quantidadeAtendida = itemAtendimento?.quantidadeAtendida || 0;
              const quantidadeDisponivel = getQuantidadeDisponivel(item.id);
              const quantidadeMaxima = getQuantidadeMaxima(item.id);

              return (
                <tr key={item.id}>
                  <td>
                    <div>
                      <strong>{item.medicamento.principioAtivo}</strong>
                    </div>
                    <small className="text-muted">
                      {item.medicamento.concentracao}
                    </small>
                  </td>
                  <td className="text-center">
                    <Badge bg="secondary">{item.quantidadeSolicitada}</Badge>
                  </td>
                  <td className="text-center">
                    <Badge bg="info">{getQuantidadeJaAtendida(item.id)}</Badge>
                  </td>
                  <td className="text-center">
                    <Badge bg="warning">{quantidadeDisponivel}</Badge>
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      min="0"
                      max={quantidadeMaxima}
                      value={quantidadeAtendida}
                      onChange={(e) => handleQuantidadeChange(item.id, Number(e.target.value))}
                      disabled={quantidadeDisponivel === 0}
                    />
                    {quantidadeDisponivel === 0 && (
                      <small className="text-muted d-block mt-1">
                        Já totalmente atendido
                      </small>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>

        <Row className="mt-3">
          <Col>
            <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
              <strong>Total a ser atendido nesta ação:</strong>
              <Badge bg="primary" className="fs-6">
                {getTotalAtendendo()} unidades
              </Badge>
            </div>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isLoading}>
          <FaTimes className="me-2" />
          Cancelar
        </Button>
        <Button variant="success" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="spinner-border spinner-border-sm me-2" />
              Atendendo...
            </>
          ) : (
            <>
              <FaCheck className="me-2" />
              Confirmar Atendimento
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AtenderRequisicaoModal;