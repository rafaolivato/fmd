// src/components/dispensacao/DispensacoesList.tsx - CORRIGIDO
import React from 'react';
import { Card, Table, Badge, Button } from 'react-bootstrap';
import type { Dispensacao } from '../../types/Dispensacao';
import { FaEye, FaFileMedical } from 'react-icons/fa';

interface DispensacoesListProps {
  dispensacoes: Dispensacao[];
  onViewDetails: (dispensacao: Dispensacao) => void;
  isLoading?: boolean;
}

const DispensacoesList: React.FC<DispensacoesListProps> = ({
  dispensacoes,
  onViewDetails,
  isLoading = false
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTotalItens = (dispensacao: Dispensacao) => {
    return dispensacao.itensDispensados.reduce((total, item) => total + item.quantidadeSaida, 0);
  };

  const getTotalMedicamentos = (dispensacao: Dispensacao) => {
    return dispensacao.itensDispensados.length;
  };

  if (isLoading) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-2">Carregando dispensações...</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">Histórico de Dispensações</h5>
        <Badge bg="light" text="dark">
          {dispensacoes.length} registros
        </Badge>
      </Card.Header>
      <Card.Body className="p-0">
        {dispensacoes.length === 0 ? (
          <div className="text-center py-5">
            <FaFileMedical size={48} className="text-muted mb-3" />
            <p className="text-muted">Nenhuma dispensação encontrada.</p>
            <small className="text-muted">
              As dispensações aparecerão aqui após serem registradas.
            </small>
          </div>
        ) : (
          <div className="table-responsive">
            <Table striped hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Data/Hora</th>
                  <th>Paciente</th>
                  <th>Documento</th>
                  <th>Estabelecimento</th>
                  <th>Medicamentos</th>
                  <th>Profissional</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {dispensacoes.map((dispensacao) => (
                  <tr key={dispensacao.id}>
                    <td>
                      <div className="fw-semibold">{formatDate(dispensacao.dataDispensacao)}</div>
                      <small className="text-muted">{formatTime(dispensacao.dataDispensacao)}</small>
                    </td>
                    <td>
                      <div className="fw-semibold">{dispensacao.pacienteNome}</div>
                      {dispensacao.pacienteCpf && (
                        <small className="text-muted">CPF: {dispensacao.pacienteCpf}</small>
                      )}
                    </td>
                    <td>
                      <div className="fw-semibold">{dispensacao.documentoReferencia}</div>
                      {dispensacao.observacao && (
                        <small className="text-muted text-truncate" style={{ maxWidth: '150px' }}>
                          {dispensacao.observacao}
                        </small>
                      )}
                    </td>
                    <td>
                      {/* CORREÇÃO AQUI: usando optional chaining */}
                      <div>{dispensacao.estabelecimentoOrigem?.nome || 'Não informado'}</div>
                    </td>
                    <td>
                      <div className="fw-semibold">{getTotalItens(dispensacao)} unidades</div>
                      <small className="text-muted">
                        {getTotalMedicamentos(dispensacao)} tipo(s)
                      </small>
                    </td>
                    <td>
                      {dispensacao.profissionalSaude ? (
                        <div>{dispensacao.profissionalSaude}</div>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => onViewDetails(dispensacao)}
                        title="Ver detalhes"
                      >
                        <FaEye />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default DispensacoesList;