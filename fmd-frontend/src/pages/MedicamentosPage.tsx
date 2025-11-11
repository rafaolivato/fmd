import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
import { FaPlusCircle, FaPills, FaSync } from 'react-icons/fa';
import MedicamentoForm from '../components/medicamentos/MedicamentoForm';
import MedicamentoList from '../components/medicamentos/MedicamentoList';
import type { Medicamento, MedicamentoFormData } from '../types/Medicamento';
import { medicamentoService } from '../store/services/medicamentoService';

const MedicamentosPage: React.FC = () => {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMedicamento, setEditingMedicamento] = useState<Medicamento | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    loadMedicamentos();
  }, []);

  const loadMedicamentos = async () => {
    try {
      setListLoading(true);
      setError('');
      const data = await medicamentoService.getAll();
      setMedicamentos(data);
    } catch (error) {
      console.error('Erro ao carregar medicamentos:', error);
      setError('Erro ao carregar medicamentos');
    } finally {
      setListLoading(false);
    }
  };

  const handleSubmit = async (formData: MedicamentoFormData) => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      if (editingMedicamento) {
        await medicamentoService.update(editingMedicamento.id!, formData);
        setSuccess('Medicamento atualizado com sucesso!');
      } else {
        await medicamentoService.create(formData);
        setSuccess('Medicamento cadastrado com sucesso!');
      }
  
      await loadMedicamentos();
      handleCancel();
    } catch (error) {
      console.error('Erro ao salvar medicamento:', error);
      setError(error instanceof Error ? error.message : 'Erro ao salvar medicamento');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (medicamento: Medicamento) => {
    setEditingMedicamento(medicamento);
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (medicamento: Medicamento) => {
    if (window.confirm(`Tem certeza que deseja excluir "${medicamento.principioAtivo}"?`)) {
      try {
        setError('');
        setSuccess('');
        await medicamentoService.delete(medicamento.id!);
        await loadMedicamentos();
        setSuccess('Medicamento excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir medicamento:', error);
        setError(error instanceof Error ? error.message : 'Erro ao excluir medicamento');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMedicamento(undefined);
    setError('');
    setSuccess('');
  };

  const handleNewMedicamento = () => {
    setEditingMedicamento(undefined);
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleRefresh = () => {
    loadMedicamentos();
    setError('');
    setSuccess('');
  };

  return (
    <Container fluid>
      
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center mt-3">
            <FaPills size={32} className="text-primary me-3" />
            <div>
              <h1 className="h2 mb-0">Cadastro de Medicamentos</h1>
              <p className="lead text-muted mb-0">Gerencie os medicamentos do sistema</p>
            </div>
          </div>
        </Col>
        <Col xs="auto" className="d-flex align-items-center gap-2">
          {!showForm && (
            <>
              <Button variant="outline-primary" onClick={handleRefresh} title="Atualizar lista">
                <FaSync />
              </Button>
              <Button variant="primary" onClick={handleNewMedicamento}>
                <FaPlusCircle className="me-2" />
                Novo Medicamento
              </Button>
            </>
          )}
        </Col>
      </Row>

      {/* Alertas */}
      {error && (
        <Row className="mb-3">
          <Col>
            <Alert variant="danger" dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      {success && (
        <Row className="mb-3">
          <Col>
            <Alert variant="success" dismissible onClose={() => setSuccess('')}>
              {success}
            </Alert>
          </Col>
        </Row>
      )}

      {/* Conteúdo Principal */}
      <Row>
        <Col>
          {showForm ? (
            <MedicamentoForm
              medicamento={editingMedicamento}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isLoading}
            />
          ) : (
            <MedicamentoList
              medicamentos={medicamentos}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={listLoading}
            />
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default MedicamentosPage;