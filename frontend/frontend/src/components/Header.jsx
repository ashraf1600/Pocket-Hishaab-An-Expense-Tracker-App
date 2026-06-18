import { Navbar, Container, Nav, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { FaBell, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

const Header = () => {
  const { user, logout } = useAuth();

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
        {/* Brand – visible only on mobile, hidden on desktop (sidebar shows it) */}
        <Navbar.Brand className="d-lg-none fw-bold">
          💰 Pocket Hisaab
        </Navbar.Brand>

        <Nav className="ms-auto align-items-center gap-3">
          {/* Notifications */}
          <Nav.Link className="position-relative p-0" style={{ color: '#4a4a4a' }}>
            <FaBell size={22} />
            <Badge 
              pill 
              bg="danger" 
              className="position-absolute top-0 start-100 translate-middle"
              style={{ fontSize: '0.6rem', padding: '0.2rem 0.4rem' }}
            >
              3
            </Badge>
          </Nav.Link>

          {/* User profile */}
          <div className="d-flex align-items-center gap-2 ms-2">
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

          {/* Logout button */}
          <Nav.Link onClick={logout} className="p-0" style={{ color: '#dc3545' }}>
            <FaSignOutAlt size={20} />
          </Nav.Link>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default Header;