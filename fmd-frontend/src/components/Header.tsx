// fmd-frontend/src/components/Header.tsx
import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, Navbar, Container, NavDropdown, Nav } from 'react-bootstrap';
import { logout } from '../store/slices/authSlice'; // Importe a ação de logout
import type { AppDispatch } from '../store/store';

const Header: React.FC = () => {
  const _dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogout = () => {
    _dispatch(logout()); // Chama a ação de logout
    navigate('/login'); // Redireciona para a página de login após o logout
  };

  return (
    <Navbar 
      bg="light" 
      expand="lg" 
      fixed="top" // Fixa o Navbar no topo
      style={{ 
        marginLeft: '250px', // Ocupa o espaço à direita da Sidebar
        width: 'calc(100% - 250px)', // A largura total menos a largura da Sidebar
        zIndex: 1000, // Garante que fique acima de outros elementos
        boxShadow: '0 2px 4px rgba(0,0,0,.1)', // Sombra sutil
      }}
    >
      <Container fluid>
        <Navbar.Brand href="#home">FMD System</Navbar.Brand> {/* Nome do seu sistema */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav>
            {/* Exemplo de menu de usuário ou notificações */}
            <NavDropdown title="Usuário Logado" id="basic-nav-dropdown">
              <NavDropdown.Item href="#profile">Meu Perfil</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout}>
                Sair
              </NavDropdown.Item>
            </NavDropdown>
            
            {/* Botão de Sair mais simples */}
            <Button variant="outline-danger" onClick={handleLogout} className="ms-3">
              Sair
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;