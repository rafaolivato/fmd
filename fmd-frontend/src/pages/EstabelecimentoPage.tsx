// fmd-frontend/src/pages/EstabelecimentoPage.tsx (Implementação com Redux)

import React, { useEffect, useState } from 'react';
import { Container, Button, Table, Spinner, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store/store';
import { fetchEstabelecimentos } from '../store/slices/estabelecimentoSlice'; 
import EstabelecimentoForm from '../components/estabelecimentos/EstabelecimentoForm';

const EstabelecimentoPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();

    const [showModal, setShowModal] = useState(false);
    
    // Pega o estado do Redux
    const { estabelecimentos, loading, error } = useSelector(
        (state: RootState) => state.estabelecimentos
    );

    // Carrega os dados ao montar o componente
    useEffect(() => {
        dispatch(fetchEstabelecimentos());
    }, [dispatch]);

    // Lógica para exibição condicional
    if (loading === 'pending') {
        return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;
    }

    if (error) {
        return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
    }
    
    // ... restante do código (botões de modal, etc.)

    return (
        <Container fluid className='mt-5'>
            {/* ... Título e botão ... */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                
            <h2>Cadastro de Estabelecimentos</h2>
            <Button variant="primary" onClick={() => setShowModal(true)}>
                    + Novo Estabelecimento
            </Button>
          
            </div>
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>CNPJ</th>
                        <th>Tipo</th> {/* Adicionamos o Tipo aqui */}
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Mapeia a lista real do Redux */}
                    {estabelecimentos.map((est) => (
                        <tr key={est.id}>
                            <td>{est.nome}</td>
                            <td>{est.cnpj}</td>
                            <td>{est.tipo}</td>
                            <td>
                                <Button variant="warning" size="sm" className="me-2">Editar</Button>
                                <Button variant="danger" size="sm">Excluir</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            
            <EstabelecimentoForm 
                show={showModal} 
                handleClose={() => setShowModal(false)} 
            />
        </Container>
    );
};

export default EstabelecimentoPage;