import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import PacienteForm from '../components/pacientes/PacienteForm';
import PacientesList from '../components/pacientes/PacientesList';

import type { Paciente, PacienteFormData } from '../types/Paciente';
import { pacienteService } from '../store/services/pacienteService';
import { FaUserPlus } from 'react-icons/fa';

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
        // Atualizar - implemente se quiser
        alert('Edição de paciente será implementada em breve');
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
        // Implemente se quiser deletar
        alert('Exclusão de paciente será implementada em breve');
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
          <h1>Cadastro de Pacientes</h1>
          <p className="lead">Gerencie os pacientes do sistema</p>
        </Col>
        <Col xs="auto">
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