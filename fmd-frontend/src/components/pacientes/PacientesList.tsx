import React, { useState } from 'react';
import { Card, Table, Badge, Button, Pagination } from 'react-bootstrap';
import type { Paciente } from '../../types/Paciente';
import { FaEdit, FaUser, FaTrash } from 'react-icons/fa';

interface PacientesListProps {
  pacientes: Paciente[];
  onEdit: (paciente: Paciente) => void;
  onDelete: (paciente: Paciente) => void;
  isLoading?: boolean;
  itemsPerPage?: number; // Nova prop para controlar itens por página
}

const PacientesList: React.FC<PacientesListProps> = ({
  pacientes,
  onEdit,
  onDelete,
  isLoading = false,
  itemsPerPage = 10 // Valor padrão: 10 itens por página
}) => {
  const [currentPage, setCurrentPage] = useState(1);

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

  // Cálculos de paginação
  const totalPages = Math.ceil(pacientes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPacientes = pacientes.slice(startIndex, endIndex);

  // Função para mudar de página
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Gerar itens da paginação
  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5; // Número máximo de páginas visíveis na paginação

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Botão "Anterior"
    items.push(
      <Pagination.Prev
        key="prev"
        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      />
    );

    // Primeira página
    if (startPage > 1) {
      items.push(
        <Pagination.Item key={1} onClick={() => handlePageChange(1)}>
          1
        </Pagination.Item>
      );
      if (startPage > 2) {
        items.push(<Pagination.Ellipsis key="ellipsis-start" />);
      }
    }

    // Páginas numeradas
    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <Pagination.Item
          key={page}
          active={page === currentPage}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </Pagination.Item>
      );
    }

    // Última página
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(<Pagination.Ellipsis key="ellipsis-end" />);
      }
      items.push(
        <Pagination.Item key={totalPages} onClick={() => handlePageChange(totalPages)}>
          {totalPages}
        </Pagination.Item>
      );
    }

    // Botão "Próximo"
    items.push(
      <Pagination.Next
        key="next"
        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      />
    );

    return items;
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
        <div>
          <h5 className="card-title mb-0">Pacientes Cadastrados</h5>
          {pacientes.length > 0 && (
            <small className="text-muted">
              Mostrando {startIndex + 1}-{Math.min(endIndex, pacientes.length)} de {pacientes.length} pacientes
            </small>
          )}
        </div>
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
          <>
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
                  {currentPacientes.map((paciente) => (
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
                          >
                            <FaTrash/>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            
            {/* Paginação */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center py-3 border-top">
                <Pagination className="mb-0">
                  {renderPaginationItems()}
                </Pagination>
              </div>
            )}
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default PacientesList;