import React, { useEffect, useState } from 'react';
import { Container, Button, Table, Spinner, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store/store';
import { fetchEstabelecimentos, deleteEstabelecimento} from '../store/slices/estabelecimentoSlice'; 
import EstabelecimentoForm from '../components/estabelecimentos/EstabelecimentoForm';
import type { Estabelecimento } from '../store/slices/estabelecimentoSlice';

const EstabelecimentoPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();

    const [showModal, setShowModal] = useState(false);
    const [editingEstabelecimento, setEditingEstabelecimento] = useState<Estabelecimento | null>(null);
    
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

    const handleDelete = (id: string, nome: string) => {
        // Confirmação via modal nativo
        if (window.confirm(`Tem certeza que deseja excluir o estabelecimento "${nome}"?`)) {
            dispatch(deleteEstabelecimento(id));
        }
    };

    

    // Nova função para abrir o modal em modo de edição
    const handleEdit = (estabelecimento: Estabelecimento) => {
        setEditingEstabelecimento(estabelecimento); // Define o item para edição
        setShowModal(true); // Abre o modal
    };

    // Função para fechar o modal
    const handleCloseModal = () => {
        setEditingEstabelecimento(null); // Limpa o estado de edição ao fechar
        setShowModal(false);
    };

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
                                <Button variant="warning" size="sm" className="me-2" 
                                onClick={() => handleEdit(est)} >Editar</Button>
                                <Button variant="danger" size="sm" 
                                onClick={() => handleDelete(est.id, est.nome)} 
                                >Excluir</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            

            <EstabelecimentoForm 
                show={showModal} 
                handleClose={handleCloseModal} // Use a nova função de fechar
                estabelecimentoToEdit={editingEstabelecimento} // PASSA OS DADOS PARA O FORM
            />


        </Container>
    );
};

export default EstabelecimentoPage;