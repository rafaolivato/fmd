// src/components/pacientes/PacientesList.tsx
import React from 'react';
import { Card, Table, Badge, Button } from 'react-bootstrap';
import type { Paciente } from '../../types/Paciente';
import { FaEdit, FaUser } from 'react-icons/fa';

interface PacientesListProps {
  pacientes: Paciente[];
  onEdit: (paciente: Paciente) => void;
  onDelete: (paciente: Paciente) => void;
  isLoading?: boolean;
}

const PacientesList: React.FC<PacientesListProps> = ({
  pacientes,
  onEdit,
  onDelete,
  isLoading = false
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const calcularIdade = (dataNascimento: string) => {
    const nascimento = new Date(dataNascimento);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    
    return idade;
  };

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  if (isLoading) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-2">Carregando pacientes...</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">Pacientes Cadastrados</h5>
        <Badge bg="light" text="dark">
          {pacientes.length} pacientes
        </Badge>
      </Card.Header>
      <Card.Body className="p-0">
        {pacientes.length === 0 ? (
          <div className="text-center py-5">
            <FaUser size={48} className="text-muted mb-3" />
            <p className="text-muted">Nenhum paciente cadastrado.</p>
            <small className="text-muted">
              Clique em "Novo Paciente" para cadastrar o primeiro paciente.
            </small>
          </div>
        ) : (
          <div className="table-responsive">
            <Table striped hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Paciente</th>
                  <th>CPF</th>
                  <th>Data Nasc.</th>
                  <th>Idade</th>
                  <th>Endereço</th>
                  <th>Cadastro</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {pacientes.map((paciente) => (
                  <tr key={paciente.id}>
                    <td>
                      <div className="fw-semibold">{paciente.nome}</div>
                    </td>
                    <td>
                      <code>{formatCPF(paciente.cpf)}</code>
                    </td>
                    <td>
                      {formatDate(paciente.dataNascimento)}
                    </td>
                    <td>
                      <Badge bg="info">
                        {calcularIdade(paciente.dataNascimento)} anos
                      </Badge>
                    </td>
                    <td>
                      <div className="text-truncate" style={{ maxWidth: '200px' }}>
                        {paciente.endereco || '-'}
                      </div>
                    </td>
                    <td>
                      {paciente.createdAt && (
                        <small className="text-muted">
                          {formatDate(paciente.createdAt)}
                        </small>
                      )}
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <Button
                          variant="outline-primary"
                          onClick={() => onEdit(paciente)}
                          title="Editar"
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="outline-danger"
                          onClick={() => onDelete(paciente)}
                          title="Excluir"
                          disabled // ← Desabilitado por enquanto
                        >
                          {/* <FaTrash /> */}
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

export default PacientesList;