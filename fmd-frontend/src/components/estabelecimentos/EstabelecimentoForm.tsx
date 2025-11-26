import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import type { AppDispatch } from '../../store/store';
// Garanta que o tipo UpdateEstabelecimentoData está exportado no seu slice!
import type { Estabelecimento, CreateEstabelecimentoData, UpdateEstabelecimentoData } from '../../store/slices/estabelecimentoSlice';
import { createEstabelecimento, updateEstabelecimento } from '../../store/slices/estabelecimentoSlice';


interface EstabelecimentoFormProps {
    show: boolean;
    handleClose: () => void;
    estabelecimentoToEdit: Estabelecimento | null;
}


const EstabelecimentoForm: React.FC<EstabelecimentoFormProps> = ({ show, handleClose, estabelecimentoToEdit }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { loading, error } = useSelector((state: RootState) => state.estabelecimentos);

    // Estado local para o formulário
    const [nome, setNome] = useState('');
    const [cnes, setCnes] = useState('');
    const [tipo, setTipo] = useState('ALMOXARIFADO'); // Valor inicial

    // Lógica para pré-popular os campos (useEffect)
    useEffect(() => {
        if (estabelecimentoToEdit) {
            // Edição: Preenche os campos
            setNome(estabelecimentoToEdit.nome);
            setCnes(estabelecimentoToEdit.cnes || '');
            setTipo(estabelecimentoToEdit.tipo);
        } else {
            // Criação: Limpa os campos
            setNome('');
            setCnes('');
            setTipo('ALMOXARIFADO');
        }
    }, [estabelecimentoToEdit, show]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        const data: CreateEstabelecimentoData = { nome, cnes, tipo }; // Tipagem de base

        const actionPromise = estabelecimentoToEdit
            // Para edição, precisamos do ID no payload
            ? dispatch(updateEstabelecimento({ id: estabelecimentoToEdit.id, ...data } as UpdateEstabelecimentoData))
            : dispatch(createEstabelecimento(data));

        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        actionPromise.then((resultAction: any) => {

            const result = resultAction as { meta: { requestStatus: 'fulfilled' | 'rejected' } };

            if (result.meta.requestStatus === 'fulfilled') {
                handleClose();
            }
        });
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>
                    {/* Exibe o título dinâmico */}
                    {estabelecimentoToEdit ? 'Editar Estabelecimento' : 'Novo Estabelecimento'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    
                    {/* 🌟 CAMPOS DO FORMULÁRIO (ISSO ESTAVA FALTANDO/OCULTO) 🌟 */}
                    
                    <Form.Group className="mb-3" controlId="formNome">
                        <Form.Label>Nome</Form.Label>
                        <Form.Control 
                            type="text" 
                            value={nome} 
                            onChange={(e) => setNome(e.target.value)} 
                            required 
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formCnes">
                        <Form.Label>CNES</Form.Label>
                        <Form.Control 
                            type="text" 
                            value={cnes} 
                            onChange={(e) => setCnes(e.target.value)} 
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formTipo">
                        <Form.Label>Tipo</Form.Label>
                        <Form.Select 
                            value={tipo} 
                            onChange={(e) => setTipo(e.target.value)} 
                            required
                        >
                            <option value="ALMOXARIFADO">Almoxarifado</option>
                            <option value="FARMACIA_UNIDADE">Farmácia da Unidade</option>
                            <option value="OUTRO">Outro</option>
                        </Form.Select>
                    </Form.Group>
                    
                    {/* 🌟 FIM DOS CAMPOS 🌟 */}

                    <Button
                        variant="primary"
                        type="submit"
                        disabled={loading === 'pending'}
                        className="w-100 mt-3"
                    >
                        {loading === 'pending'
                            ? (estabelecimentoToEdit ? 'Atualizando...' : 'Salvando...')
                            : 'Salvar Estabelecimento'}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default EstabelecimentoForm;