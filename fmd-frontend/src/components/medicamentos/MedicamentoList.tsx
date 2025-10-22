import React from 'react';
import type { Medicamento } from '../../types/Medicamento';

interface MedicamentoListProps {
  medicamentos: Medicamento[];
  onEdit: (medicamento: Medicamento) => void;
  onDelete: (medicamento: Medicamento) => void;
  isLoading?: boolean;
}

const MedicamentoList: React.FC<MedicamentoListProps> = ({
  medicamentos,
  onEdit,
  onDelete,
  isLoading = false
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-2">Carregando medicamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">Medicamentos Cadastrados</h5>
      </div>
      <div className="card-body">
        {medicamentos.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted">Nenhum medicamento cadastrado.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Princípio Ativo</th>
                  <th>Concentração</th>
                  <th>Forma Farmacêutica</th>
                  <th>Psicotrópico</th>
                  <th>Estoque</th>
                  <th>Cadastro</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {medicamentos.map(medicamento => (
                  <tr key={medicamento.id}>
                    <td>
                      <strong>{medicamento.principioAtivo}</strong>
                    </td>
                    <td>{medicamento.concentracao}</td>
                    <td>{medicamento.formaFarmaceutica}</td>
                    <td>
                      {medicamento.psicotropico ? (
                        <span className="badge bg-warning">Sim</span>
                      ) : (
                        <span className="badge bg-secondary">Não</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${medicamento.quantidadeEstoque > 0 ? 'bg-success' : 'bg-danger'}`}>
                        {medicamento.quantidadeEstoque}
                      </span>
                    </td>
                    <td>{medicamento.createdAt && formatDate(medicamento.createdAt)}</td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => onEdit(medicamento)}
                          title="Editar"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => onDelete(medicamento)}
                          title="Excluir"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicamentoList;