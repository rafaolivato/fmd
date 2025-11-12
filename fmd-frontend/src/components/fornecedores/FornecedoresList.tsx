// src/components/fornecedores/FornecedoresList.tsx
import React from 'react';
import { Card, Table, Badge, Button } from 'react-bootstrap';
import type { Fornecedor } from '../../types/Fornecedor';
import { FaEdit, FaBuilding, FaTrash } from 'react-icons/fa';

interface FornecedoresListProps {
  fornecedores: Fornecedor[];
  onEdit: (fornecedor: Fornecedor) => void;
  onDelete: (fornecedor: Fornecedor) => void;
  isLoading?: boolean;
}

const FornecedoresList: React.FC<FornecedoresListProps> = ({
  fornecedores,
  onEdit,
  onDelete,
  isLoading = false
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCNPJ = (cnpj: string) => {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const formatTelefone = (telefone?: string) => {
    if (!telefone) return '-';
    const numbers = telefone.replace(/\D/g, '');
    if (numbers.length === 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (numbers.length === 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return telefone;
  };

  if (isLoading) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-2">Carregando fornecedores...</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">Fornecedores Cadastrados</h5>
        <Badge bg="light" text="dark">
          {fornecedores.length} fornecedores
        </Badge>
      </Card.Header>
      <Card.Body className="p-0">
        {fornecedores.length === 0 ? (
          <div className="text-center py-5">
            <FaBuilding size={48} className="text-muted mb-3" />
            <p className="text-muted">Nenhum fornecedor cadastrado.</p>
            <small className="text-muted">
              Clique em "Novo Fornecedor" para cadastrar o primeiro fornecedor.
            </small>
          </div>
        ) : (
          <div className="table-responsive">
            <Table striped hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Fornecedor</th>
                  <th>CNPJ</th>
                  <th>Contato</th>
                  <th>Status</th>
                  <th>Cadastro</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {fornecedores.map((fornecedor) => (
                  <tr key={fornecedor.id}>
                    <td>
                      <div className="fw-semibold">{fornecedor.nome}</div>
                      {fornecedor.endereco && (
                        <small className="text-muted text-truncate d-block" style={{ maxWidth: '200px' }}>
                          {fornecedor.endereco}
                        </small>
                      )}
                    </td>
                    <td>
                      <code>{formatCNPJ(fornecedor.cnpj)}</code>
                    </td>
                    <td>
                      <div>
                        {fornecedor.telefone && (
                          <div className="small">{formatTelefone(fornecedor.telefone)}</div>
                        )}
                        {fornecedor.email && (
                          <div className="small text-truncate" style={{ maxWidth: '150px' }}>
                            {fornecedor.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <Badge bg={fornecedor.ativo ? "success" : "secondary"}>
                        {fornecedor.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </td>
                    <td>
                      {fornecedor.createdAt && (
                        <small className="text-muted">
                          {formatDate(fornecedor.createdAt)}
                        </small>
                      )}
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <Button
                          variant="outline-primary"
                          onClick={() => onEdit(fornecedor)}
                          title="Editar"
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="outline-danger"
                          onClick={() => onDelete(fornecedor)}
                          title="Excluir"
                        >
                          <FaTrash />
                        </Button>
                      </div>
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

export default FornecedoresList;