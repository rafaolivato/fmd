// fmd-frontend/src/components/Header.tsx
import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Navbar, Container, NavDropdown, Nav } from 'react-bootstrap';
import { logout } from '../store/slices/authSlice';
import type { AppDispatch } from '../store/store';
import {
  FaUserCircle,
  FaBell,
  FaSignOutAlt,
  FaUser,
  FaHospital
} from 'react-icons/fa';

const Header: React.FC = () => {
  const _dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogout = () => {
    _dispatch(logout());
    navigate('/login');
  };

  return (
    <Navbar
      bg="light"
      expand="lg"
      fixed="top"
      style={{
        marginLeft: '250px',
        width: 'calc(100% - 250px)',
        zIndex: 1000,
        boxShadow: '0 2px 4px rgba(0,0,0,.1)',
      }}
    >
      <Container fluid>
        <Navbar.Brand href="#home" className="d-flex align-items-center">
          
          <FaHospital className="me-2" color="#0d6efd" size={20} />
          <span className="fw-bold">FMD</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />


        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav className="d-flex align-items-center">

            {/* Notificações */}
            <Nav.Link className="position-relative me-3">
              <FaBell size={18} className="text-muted" />
            </Nav.Link>

            {/* Menu do Usuário */}
            <NavDropdown
              title={
                <span className="d-flex align-items-center">
                  <FaUserCircle className="me-2" size={20} />
                  Usuário Logado
                </span>
              }
              id="user-dropdown"
              align="end"
            >
              <NavDropdown.Item href="#profile" className="d-flex align-items-center">
                <FaUser className="me-2" size={14} />
                Meu Perfil
              </NavDropdown.Item>

              <NavDropdown.Divider />

              <NavDropdown.Item
                onClick={handleLogout}
                className="d-flex align-items-center text-danger"
              >
                <FaSignOutAlt className="me-2" size={14} />
                Sair
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;