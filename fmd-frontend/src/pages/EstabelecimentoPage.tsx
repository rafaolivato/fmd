import React, { useEffect, useState } from 'react';
import { Container, Button, Table, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store/store';
import { fetchEstabelecimentos, deleteEstabelecimento } from '../store/slices/estabelecimentoSlice';
import EstabelecimentoForm from '../components/estabelecimentos/EstabelecimentoForm';
import type { Estabelecimento } from '../store/slices/estabelecimentoSlice';
import { FaStore, FaPlusCircle, FaTrash, FaEdit } from 'react-icons/fa';
import type { TipoEstabelecimento } from '../types/Estabelecimento';

const EstabelecimentoPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [showModal, setShowModal] = useState(false);
  const [editingEstabelecimento, setEditingEstabelecimento] = useState<Estabelecimento | null>(null);

  const { estabelecimentos, loading, error } = useSelector(
    (state: RootState) => state.estabelecimentos
  );

  useEffect(() => {
    dispatch(fetchEstabelecimentos());
  }, [dispatch]);

  if (loading === 'pending') {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  const tipoLabels: Record<TipoEstabelecimento, string> = {
    ALMOXARIFADO: "Almoxarifado",
    FARMACIA_UNIDADE: "Farmácia da Unidade",
    OUTRO: "Outro"
  };
  const handleDelete = (id: string, nome: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o estabelecimento "${nome}"?`)) {
      dispatch(deleteEstabelecimento(id));
    }
  };

  const handleEdit = (estabelecimento: Estabelecimento) => {
    setEditingEstabelecimento(estabelecimento);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setEditingEstabelecimento(null);
    setShowModal(false);
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center mt-3">
            <FaStore size={32} className="text-primary me-3" />
            <div>
              <h1 className="h2 mb-0">Cadastro de Estabelecimentos</h1>
              <p className="lead text-muted mb-0">Gerencie os estabelecimentos</p>
            </div>
          </div>
        </Col>
        <Col xs="auto" className="d-flex align-items-center gap-2">
          <Button variant="primary" onClick={() => setShowModal(true)}>
            <FaPlusCircle className="me-2" />
            Novo Estabelecimento
          </Button>
        </Col>
      </Row>

      <Row>
        <Col>
          <Table striped bordered hover responsive className="align-middle">
            <thead>
              <tr>
                <th>Nome</th>
                <th>CNES</th>
                <th>Tipo</th>
                <th className="text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {estabelecimentos.map((est) => (
                <tr key={est.id}>
                  <td>{est.nome}</td>
                  <td>{est.cnes}</td>
                  <td>{tipoLabels[est.tipo]}</td>
                  <td className="text-center">
                    <div className="btn-group btn-group-sm">
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={() => handleEdit(est)}
                        title="Editar"
                      >
                        <FaEdit />
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => handleDelete(est.id, est.nome)}
                        title="Excluir"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>

      <EstabelecimentoForm
        show={showModal}
        handleClose={handleCloseModal}
        estabelecimentoToEdit={editingEstabelecimento}
      />
    </Container>
  );
};

export default EstabelecimentoPage;
