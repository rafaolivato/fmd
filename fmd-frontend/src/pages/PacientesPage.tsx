import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import PacienteForm from '../components/pacientes/PacienteForm';
import PacientesList from '../components/pacientes/PacientesList';
import type { Paciente, PacienteFormData } from '../types/Paciente';
import { pacienteService } from '../store/services/pacienteService';
import { FaBuilding, FaUser, FaUserPlus } from 'react-icons/fa';

const PacientesPage: React.FC = () => {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPaciente, setEditingPaciente] = useState<Paciente | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    loadPacientes();
  }, []);

  const loadPacientes = async () => {
    try {
      setListLoading(true);
      const data = await pacienteService.getAll();
      setPacientes(data);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
      alert('Erro ao carregar pacientes');
    } finally {
      setListLoading(false);
    }
  };

  const handleSubmit = async (formData: PacienteFormData) => {
    try {
      setIsLoading(true);

      if (editingPaciente) {
        // ✅ CORREÇÃO: Implementar edição
        await pacienteService.update(editingPaciente.id, formData);
        alert('Paciente atualizado com sucesso!');
      } else {
        await pacienteService.create(formData);
        alert('Paciente cadastrado com sucesso!');
      }

      await loadPacientes();
      handleCancel();
    } catch (error: any) {
      console.error('Erro ao salvar paciente:', error);
      alert(error instanceof Error ? error.message : 'Erro ao salvar paciente');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (paciente: Paciente) => {
    setEditingPaciente(paciente);
    setShowForm(true);
  };

  const handleDelete = async (paciente: Paciente) => {
    if (window.confirm(`Tem certeza que deseja excluir "${paciente.nome}"?`)) {
      try {
        // ✅ CORREÇÃO: Implementar exclusão
        await pacienteService.delete(paciente.id);
        alert('Paciente excluído com sucesso!');
        await loadPacientes();
      } catch (error) {
        console.error('Erro ao excluir paciente:', error);
        alert('Erro ao excluir paciente');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPaciente(undefined);
  };

  const handleNewPaciente = () => {
    setEditingPaciente(undefined);
    setShowForm(true);
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center mt-3">
            <FaUser size={32} className="text-primary mb-3 me-3" />
            <div>
              <h1 className="h2 mb-0"> Cadastro de Pacientes</h1>
              <p className="lead text-muted mb-0"> Gerencie os pacientes do sistema</p>
            </div>
          </div>
        </Col>
         <Col xs="auto" className="d-flex align-items-center gap-2">
          {!showForm && (
            <Button variant="primary" onClick={handleNewPaciente}>
              <FaUserPlus className="me-2" />
              Novo Paciente
            </Button>
          )}
        </Col>
      </Row>

      <Row>
        <Col>
          {showForm ? (
            <PacienteForm
              paciente={editingPaciente}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isLoading}
            />
          ) : (
            <PacientesList
              pacientes={pacientes}
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

export default PacientesPage;