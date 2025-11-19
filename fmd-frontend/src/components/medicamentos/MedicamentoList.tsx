import React from 'react';
import type { Medicamento } from '../../types/Medicamento';
import { FaEdit, FaTrash, FaExclamationTriangle } from 'react-icons/fa';

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
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-2 text-muted">Carregando medicamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-white py-3">
        <h5 className="card-title mb-0 text-primary d-flex align-items-center">
          Medicamentos Cadastrados
        </h5>
      </div>
      <div className="card-body p-0">
        {medicamentos.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted mb-0">Nenhum medicamento cadastrado.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Princípio Ativo</th>
                  <th>Concentração</th>
                  <th>Forma Farm.</th>
                  <th className="text-center">Est. Mínimo</th>
                  <th className="text-center">Est. Atual</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {medicamentos.map(medicamento => {
                  // Lógica simples para verificar se está abaixo do mínimo (opcional, apenas visual)
                  const isLowStock = (medicamento.quantidadeEstoque || 0) <= (medicamento.estoqueMinimo || 0);

                  return (
                    <tr key={medicamento.id}>
                      <td className="fw-bold text-primary">{medicamento.principioAtivo}</td>
                      <td>{medicamento.concentracao}</td>
                      <td>{medicamento.formaFarmaceutica}</td>

                      {/* Coluna Estoque Mínimo */}
                      <td className="text-center fw-bold">
                        {medicamento.estoqueMinimo}
                      </td>

                      {/* Coluna Estoque Atual */}
                      <td className={`text-center fw-bold ${isLowStock ? 'text-danger' : 'text-success'}`}>
                        {medicamento.quantidadeEstoque || 0}
                        {isLowStock && <FaExclamationTriangle size={14} className="ms-1" />}
                      </td>

                      {/* Coluna Status (Psicotrópico) */}
                      <td className="text-center">
                        {medicamento.psicotropico ? (
                          <span className="badge bg-warning text-dark">Psicotrópico</span>
                        ) : (
                          <span className="badge bg-light text-secondary border">Comum</span>
                        )}
                      </td>

                      <td className="text-center">
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={() => onEdit(medicamento)}
                            title="Editar"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => onDelete(medicamento)}
                            title="Excluir"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicamentoList;