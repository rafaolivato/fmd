import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Container, NavDropdown, Nav, Badge } from 'react-bootstrap';
import { authService } from '../store/services/authService'; // ✅ Importe seu authService
import {
  FaUserCircle,
  FaBell,
  FaSignOutAlt,
  FaUser,
  FaHospital,
  FaStore
} from 'react-icons/fa';

const Header: React.FC = () => {
  const navigate = useNavigate();
  
  // ✅ Busca o usuário do authService
  const usuarioLogado = authService.getUserFromStorage();

  const handleLogout = () => {
    authService.logout(); // ✅ Usa o método do authService
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/perfil');
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
              <Badge 
                bg="danger" 
                className="position-absolute top-0 start-100 translate-middle"
                style={{ fontSize: '0.6rem' }}
              >
                0
              </Badge>
            </Nav.Link>

            {/* Menu do Usuário */}
            <NavDropdown
              title={
                <span className="d-flex align-items-center">
                  <FaUserCircle className="me-2" size={20} />
                  {usuarioLogado ? (
                    <span className="text-truncate" style={{ maxWidth: '150px' }}>
                      {usuarioLogado.name}
                    </span>
                  ) : (
                    'Usuário'
                  )}
                </span>
              }
              id="user-dropdown"
              align="end"
            >
              {usuarioLogado && (
                <>
                  <div className="px-3 py-2 border-bottom">
                    <div className="fw-bold text-truncate">{usuarioLogado.name}</div>
                    <div className="small text-muted text-truncate">{usuarioLogado.email}</div>
                    {usuarioLogado.estabelecimento && (
                      <div className="small d-flex align-items-center mt-1">
                        <FaStore size={12} className="me-1 text-muted" />
                        <span className="text-truncate">{usuarioLogado.estabelecimento.nome}</span>
                        <Badge 
                          bg={usuarioLogado.estabelecimento.tipo === 'ALMOXARIFADO' ? 'primary' : 'success'} 
                          className="ms-2"
                          style={{ fontSize: '0.6rem' }}
                        >
                          {usuarioLogado.estabelecimento.tipo === 'ALMOXARIFADO' ? 'Almoxarifado' : 'Farmácia'}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <NavDropdown.Divider />
                </>
              )}

              <NavDropdown.Item 
                onClick={handleProfile} 
                className="d-flex align-items-center"
              >
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