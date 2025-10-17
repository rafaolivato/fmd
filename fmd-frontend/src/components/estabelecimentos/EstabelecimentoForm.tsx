// fmd-frontend/src/components/estabelecimentos/EstabelecimentoForm.tsx
import React, { useState} from 'react';
import type { FormEvent } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import type { AppDispatch } from '../../store/store';   
import { createEstabelecimento } from '../../store/slices/estabelecimentoSlice'; 

interface EstabelecimentoFormProps {
    show: boolean;
    handleClose: () => void;
}

const EstabelecimentoForm: React.FC<EstabelecimentoFormProps> = ({ show, handleClose }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { loading, error } = useSelector((state: RootState) => state.estabelecimentos);
    
    // Estado local para o formulário
    const [nome, setNome] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [tipo, setTipo] = useState('ALMOXARIFADO'); // Valor inicial
    
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        
        // Dispara o Thunk de criação
        dispatch(createEstabelecimento({ nome, cnpj, tipo })).then((result) => {
            // Se a criação for bem-sucedida, feche o modal e limpe o formulário
            if (result.meta.requestStatus === 'fulfilled') {
                setNome('');
                setCnpj('');
                setTipo('ALMOXARIFADO');
                handleClose(); 
            }
        });
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Novo Estabelecimento</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    
                    <Form.Group className="mb-3" controlId="formNome">
                        <Form.Label>Nome</Form.Label>
                        <Form.Control type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formCNPJ">
                        <Form.Label>CNPJ (Opcional)</Form.Label>
                        <Form.Control type="text" value={cnpj} onChange={(e) => setCnpj(e.target.value)} />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formTipo">
                        <Form.Label>Tipo</Form.Label>
                        <Form.Select value={tipo} onChange={(e) => setTipo(e.target.value)} required>
                            <option value="ALMOXARIFADO">Almoxarifado</option>
                            <option value="FARMACIA_UNIDADE">Farmácia da Unidade</option>
                            <option value="OUTRO">Outro</option>
                        </Form.Select>
                    </Form.Group>

                    <Button 
                        variant="primary" 
                        type="submit" 
                        disabled={loading === 'pending'} 
                        className="w-100 mt-3"
                    >
                        {loading === 'pending' ? 'Salvando...' : 'Salvar Estabelecimento'}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default EstabelecimentoForm;