import React, { useState, useEffect } from 'react';
import type { Medicamento } from '../../types/Medicamento';
import { 
  FaEdit, 
  FaTrash, 
  FaExclamationTriangle, 
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaFilter,
  FaTimes
} from 'react-icons/fa';

interface MedicamentoListProps {
  medicamentos: Medicamento[];
  onEdit: (medicamento: Medicamento) => void;
  onDelete: (medicamento: Medicamento) => void;
  isLoading?: boolean;
  itemsPerPage?: number;
}

type SortField = 'principioAtivo' | 'concentracao' | 'quantidadeEstoque' | 'estoqueMinimo';
type SortDirection = 'asc' | 'desc';

const MedicamentoList: React.FC<MedicamentoListProps> = ({
  medicamentos,
  onEdit,
  onDelete,
  isLoading = false,
  itemsPerPage = 20
}) => {
  // Estados para paginação e filtros
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('principioAtivo');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [showPsychotropicOnly, setShowPsychotropicOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Filtrar medicamentos
  const filteredMedicamentos = medicamentos.filter(medicamento => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      medicamento.principioAtivo.toLowerCase().includes(searchLower) ||
      medicamento.concentracao.toLowerCase().includes(searchLower) ||
      medicamento.formaFarmaceutica.toLowerCase().includes(searchLower);

    const isLowStock = (medicamento.quantidadeEstoque || 0) <= (medicamento.estoqueMinimo || 0);
    const matchesLowStock = !showLowStockOnly || isLowStock;
    const matchesPsychotropic = !showPsychotropicOnly || medicamento.psicotropico;

    return matchesSearch && matchesLowStock && matchesPsychotropic;
  });

  // Ordenar medicamentos
  const sortedMedicamentos = [...filteredMedicamentos].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === 'principioAtivo' || sortField === 'concentracao') {
      aValue = aValue?.toString().toLowerCase() || '';
      bValue = bValue?.toString().toLowerCase() || '';
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Paginação
  const totalPages = Math.ceil(sortedMedicamentos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMedicamentos = sortedMedicamentos.slice(startIndex, endIndex);

  // Resetar para primeira página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, showLowStockOnly, showPsychotropicOnly, sortField, sortDirection]);

  // Handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <FaSort className="text-muted opacity-50" />;
    return sortDirection === 'asc' ? <FaSortUp className="text-primary" /> : <FaSortDown className="text-primary" />;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setShowLowStockOnly(false);
    setShowPsychotropicOnly(false);
    setSortField('principioAtivo');
    setSortDirection('asc');
  };

  const hasActiveFilters = searchTerm || showLowStockOnly || showPsychotropicOnly || sortField !== 'principioAtivo' || sortDirection !== 'asc';

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
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <div className="d-flex align-items-center mb-2 mb-md-0">
            <h5 className="card-title mb-0 text-primary me-3">
              Medicamentos Cadastrados
            </h5>
            <span className="badge bg-secondary">
              {filteredMedicamentos.length} de {medicamentos.length}
            </span>
          </div>
          
          <div className="d-flex align-items-center gap-2">
            {/* Botão para mostrar/ocultar filtros em telas pequenas */}
            <button
              className="btn btn-sm btn-outline-secondary d-md-none"
              onClick={() => setShowFilters(!showFilters)}
              type="button"
            >
              <FaFilter className="me-1" />
              Filtros
              {hasActiveFilters && (
                <span className="ms-1 badge bg-primary rounded-circle" style={{ fontSize: '0.6rem', padding: '2px 5px' }}>
                  !
                </span>
              )}
            </button>

            {/* Filtros rápidos - visíveis apenas em telas médias+ */}
            <div className="d-none d-md-flex align-items-center gap-2">
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="lowStockOnly"
                  checked={showLowStockOnly}
                  onChange={(e) => setShowLowStockOnly(e.target.checked)}
                />
                <label className="form-check-label text-danger small" htmlFor="lowStockOnly">
                  <FaExclamationTriangle className="me-1" />
                  Baixo estoque
                </label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="psychotropicOnly"
                  checked={showPsychotropicOnly}
                  onChange={(e) => setShowPsychotropicOnly(e.target.checked)}
                />
                <label className="form-check-label text-warning small" htmlFor="psychotropicOnly">
                  Psicotrópicos
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros para mobile (expandível) */}
        {showFilters && (
          <div className="d-md-none mt-3 p-3 bg-light rounded">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0">Filtros</h6>
              <button 
                className="btn btn-sm btn-link text-decoration-none"
                onClick={() => setShowFilters(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="lowStockOnlyMobile"
                checked={showLowStockOnly}
                onChange={(e) => setShowLowStockOnly(e.target.checked)}
              />
              <label className="form-check-label text-danger" htmlFor="lowStockOnlyMobile">
                <FaExclamationTriangle className="me-1" />
                Apenas baixo estoque
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="psychotropicOnlyMobile"
                checked={showPsychotropicOnly}
                onChange={(e) => setShowPsychotropicOnly(e.target.checked)}
              />
              <label className="form-check-label text-warning" htmlFor="psychotropicOnlyMobile">
                Apenas psicotrópicos
              </label>
            </div>
          </div>
        )}

        {/* Barra de busca - Agora com placeholder melhor */}
        <div className="mt-3">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0">
              <FaSearch className="text-muted" />
            </span>
            <p></p>
            <input
              type="text"
              className="form-control border-start-3 px-2"
              placeholder="Buscar medicamentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                minWidth: '300px' // Garante um tamanho mínimo
              }}
              title="Busque por princípio ativo, concentração ou forma farmacêutica"
            />
            {(searchTerm || hasActiveFilters) && (
              <button
                className="btn btn-outline-secondary border-start-0"
                type="button"
                onClick={clearFilters}
                title="Limpar todos os filtros"
              >
                <FaTimes />
              </button>
            )}
          </div>
          <small className="text-muted mt-1 d-block">
            {searchTerm ? (
              <>
                Buscando por: "<strong>{searchTerm}</strong>"
              </>
            ) : (
              <>
                Digite princípio ativo, concentração ou forma farmacêutica
              </>
            )}
          </small>
        </div>
      </div>

      <div className="card-body p-0">
        {currentMedicamentos.length === 0 ? (
          <div className="text-center py-5">
            <div className="py-4">
              <FaSearch size={48} className="text-muted mb-3" />
              <p className="text-muted mb-2 fs-5">
                {filteredMedicamentos.length === 0 && medicamentos.length > 0
                  ? 'Nenhum medicamento encontrado'
                  : 'Nenhum medicamento cadastrado'}
              </p>
              {searchTerm ? (
                <p className="text-muted">
                  Não encontramos resultados para "<strong>{searchTerm}</strong>"
                </p>
              ) : hasActiveFilters ? (
                <p className="text-muted">
                  Nenhum medicamento corresponde aos filtros aplicados
                </p>
              ) : null}
              
              {(searchTerm || hasActiveFilters) && (
                <button
                  className="btn btn-primary mt-3"
                  onClick={clearFilters}
                >
                  <FaTimes className="me-2" />
                  Limpar filtros
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-striped table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th 
                      style={{ cursor: 'pointer', minWidth: '200px' }}
                      onClick={() => handleSort('principioAtivo')}
                      className="position-relative"
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <span>Princípio Ativo</span>
                        <span>{getSortIcon('principioAtivo')}</span>
                      </div>
                    </th>
                    <th 
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSort('concentracao')}
                      className="position-relative"
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <span>Concentração</span>
                        <span>{getSortIcon('concentracao')}</span>
                      </div>
                    </th>
                    <th>Forma Farm.</th>
                    <th 
                      className="text-center"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSort('estoqueMinimo')}
                    >
                      <div className="d-flex align-items-center justify-content-center">
                        <span className="me-1">Est. Mínimo</span>
                        {getSortIcon('estoqueMinimo')}
                      </div>
                    </th>
                    <th 
                      className="text-center"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSort('quantidadeEstoque')}
                    >
                      <div className="d-flex align-items-center justify-content-center">
                        <span className="me-1">Est. Atual</span>
                        {getSortIcon('quantidadeEstoque')}
                      </div>
                    </th>
                    <th className="text-center">Status</th>
                    <th className="text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMedicamentos.map(medicamento => {
                    const isLowStock = (medicamento.quantidadeEstoque || 0) <= (medicamento.estoqueMinimo || 0);

                    return (
                      <tr key={medicamento.id}>
                        <td className="fw-bold text-primary">
                          <div className="d-flex align-items-center">
                            {medicamento.principioAtivo}
                            {isLowStock && (
                              <FaExclamationTriangle 
                                size={12} 
                                className="ms-2 text-danger" 
                                title="Estoque baixo"
                              />
                            )}
                          </div>
                        </td>
                        <td>{medicamento.concentracao}</td>
                        <td>{medicamento.formaFarmaceutica}</td>
                        <td className="text-center fw-bold">
                          {medicamento.estoqueMinimo}
                        </td>
                        <td className={`text-center fw-bold ${isLowStock ? 'text-danger' : 'text-success'}`}>
                          <div className="d-flex align-items-center justify-content-center">
                            {medicamento.quantidadeEstoque || 0}
                            {isLowStock && (
                              <div className="ms-2 badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25">
                                Baixo
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="text-center">
                          {medicamento.psicotropico ? (
                            <span className="badge bg-warning bg-opacity-15 text-dark border border-warning border-opacity-25">
                              Psicotrópico
                            </span>
                          ) : (
                            <span className="badge bg-light bg-opacity-50 text-secondary border">
                              Comum
                            </span>
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

            {/* Paginação - Versão melhorada */}
            {totalPages > 1 && (
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-center p-3 border-top gap-3">
                <div className="text-muted small">
                  <span className="d-inline-block me-2">
                    Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
                  </span>
                  <span className="d-inline-block">
                    (<strong>{sortedMedicamentos.length}</strong> medicamentos)
                  </span>
                </div>
                
                <nav aria-label="Paginação de medicamentos" className="mb-0">
                  <ul className="pagination pagination-sm justify-content-center mb-0">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        aria-label="Página anterior"
                      >
                        <FaChevronLeft />
                      </button>
                    </li>

                    {/* Mostrar sempre as primeiras 2 páginas */}
                    {[1, 2].filter(page => page <= totalPages).map(page => (
                      <li 
                        key={page} 
                        className={`page-item ${currentPage === page ? 'active' : ''}`}
                      >
                        <button 
                          className="page-link" 
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      </li>
                    ))}

                    {/* Ellipsis se necessário */}
                    {currentPage > 4 && (
                      <li className="page-item disabled">
                        <span className="page-link">...</span>
                      </li>
                    )}

                    {/* Página atual e vizinhas */}
                    {[...Array(totalPages)].map((_, i) => {
                      const pageNumber = i + 1;
                      if (pageNumber > 2 && pageNumber < totalPages - 1) {
                        if (Math.abs(pageNumber - currentPage) <= 1) {
                          return (
                            <li 
                              key={pageNumber} 
                              className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}
                            >
                              <button 
                                className="page-link" 
                                onClick={() => handlePageChange(pageNumber)}
                              >
                                {pageNumber}
                              </button>
                            </li>
                          );
                        }
                      }
                      return null;
                    }).filter(Boolean)}

                    {/* Ellipsis se necessário */}
                    {currentPage < totalPages - 3 && totalPages > 5 && (
                      <li className="page-item disabled">
                        <span className="page-link">...</span>
                      </li>
                    )}

                    {/* Últimas 2 páginas */}
                    {totalPages > 2 && [totalPages - 1, totalPages].map(page => (
                      page > 2 && page <= totalPages && (
                        <li 
                          key={page} 
                          className={`page-item ${currentPage === page ? 'active' : ''}`}
                        >
                          <button 
                            className="page-link" 
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </button>
                        </li>
                      )
                    )).filter(Boolean)}

                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        aria-label="Próxima página"
                      >
                        <FaChevronRight />
                      </button>
                    </li>
                  </ul>
                </nav>

                {/* Seletor de itens por página */}
                <div className="d-flex align-items-center small">
                  <label className="me-2 text-muted">Exibir:</label>
                  <select
                    className="form-select form-select-sm w-auto"
                    value={itemsPerPage}
                    onChange={(e) => {
                      const newItemsPerPage = parseInt(e.target.value);
                      setCurrentPage(1);
                      // Você pode querer elevar este estado para o componente pai
                    }}
                  >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                  <span className="ms-2 text-muted">por página</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MedicamentoList;