import React, { useState, useEffect } from 'react';
import type { Medicamento, MedicamentoFormData } from '../../types/Medicamento';

interface MedicamentoFormProps {
  medicamento?: Medicamento;
  onSubmit: (data: MedicamentoFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const MedicamentoForm: React.FC<MedicamentoFormProps> = ({
  medicamento,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<MedicamentoFormData>({
    principioAtivo: '',
    concentracao: '',
    formaFarmaceutica: '',
    psicotropico: false
  });

  const [errors, setErrors] = useState<Partial<MedicamentoFormData>>({});

  useEffect(() => {
    if (medicamento) {
      setFormData({
        principioAtivo: medicamento.principioAtivo,
        concentracao: medicamento.concentracao,
        formaFarmaceutica: medicamento.formaFarmaceutica,
        psicotropico: medicamento.psicotropico
      });
    }
  }, [medicamento]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));

    // Limpar erro do campo quando usuário começar a digitar
    if (errors[name as keyof MedicamentoFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<MedicamentoFormData> = {};

    if (!formData.principioAtivo.trim()) {
      newErrors.principioAtivo = 'Princípio ativo é obrigatório';
    }

    if (!formData.concentracao.trim()) {
      newErrors.concentracao = 'Concentração é obrigatória';
    }

    if (!formData.formaFarmaceutica.trim()) {
      newErrors.formaFarmaceutica = 'Forma farmacêutica é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">
          {medicamento ? 'Editar Medicamento' : 'Novo Medicamento'}
        </h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="principioAtivo" className="form-label">
                Princípio Ativo *
              </label>
              <input
                type="text"
                className={`form-control ${errors.principioAtivo ? 'is-invalid' : ''}`}
                id="principioAtivo"
                name="principioAtivo"
                value={formData.principioAtivo}
                onChange={handleChange}
                placeholder="Ex: Dipirona, Paracetamol"
              />
              {errors.principioAtivo && (
                <div className="invalid-feedback">{errors.principioAtivo}</div>
              )}
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="concentracao" className="form-label">
                Concentração *
              </label>
              <input
                type="text"
                className={`form-control ${errors.concentracao ? 'is-invalid' : ''}`}
                id="concentracao"
                name="concentracao"
                value={formData.concentracao}
                onChange={handleChange}
                placeholder="Ex: 500mg, 10mg/mL"
              />
              {errors.concentracao && (
                <div className="invalid-feedback">{errors.concentracao}</div>
              )}
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="formaFarmaceutica" className="form-label">
                Forma Farmacêutica *
              </label>
              <select
                className={`form-select ${errors.formaFarmaceutica ? 'is-invalid' : ''}`}
                id="formaFarmaceutica"
                name="formaFarmaceutica"
                value={formData.formaFarmaceutica}
                onChange={handleChange}
              >
                <option value="">Selecione...</option>
                <option value="Comprimido">Comprimido</option>
                <option value="Cápsula">Cápsula</option>
                <option value="Xarope">Xarope</option>
                <option value="Solução">Solução</option>
                <option value="Pomada">Pomada</option>
                <option value="Creme">Creme</option>
                <option value="Gel">Gel</option>
                <option value="Injetável">Injetável</option>
                <option value="Supositório">Supositório</option>
                <option value="Spray">Spray</option>
                <option value="Adesivo">Adesivo</option>
              </select>
              {errors.formaFarmaceutica && (
                <div className="invalid-feedback">{errors.formaFarmaceutica}</div>
              )}
            </div>

            <div className="col-md-6 mb-3">
              <div className="form-check mt-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="psicotropico"
                  name="psicotropico"
                  checked={formData.psicotropico}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="psicotropico">
                  Psicotrópico
                </label>
                <div className="form-text">
                  Marque se o medicamento é controlado (psicotrópico)
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Salvando...
                </>
              ) : (
                medicamento ? 'Atualizar' : 'Cadastrar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MedicamentoForm;