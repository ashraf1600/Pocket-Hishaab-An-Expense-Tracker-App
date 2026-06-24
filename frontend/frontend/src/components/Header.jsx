import { Navbar, Container, Nav } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { FaUserCircle } from 'react-icons/fa';

const Header = () => {
  const { user } = useAuth();

  return (
    <Navbar
      className="px-4 py-2"
      style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.3)',
      }}
    >
      <Container fluid className="px-0">
        <Navbar.Brand className="d-lg-none fw-bold">
          💰 Pocket Hisaab
        </Navbar.Brand>

        <Nav className="ms-auto align-items-center">
          <div className="d-flex align-items-center gap-2">
            <FaUserCircle size={34} className="text-primary" />
            <div className="d-none d-sm-block">
              <div className="fw-semibold" style={{ fontSize: '0.9rem', lineHeight: 1.2 }}>
                {user?.name || 'User'}
              </div>
              <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                {user?.email || 'user@example.com'}
              </small>
            </div>
          </div>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default Header;