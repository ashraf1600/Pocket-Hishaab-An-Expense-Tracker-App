import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { 
  FaHome, 
  FaMoneyBillWave, 
  FaTags, 
  FaWallet, 
  FaChartPie, 
  FaSignOutAlt,
  FaUserCircle 
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <div 
      className="d-flex flex-column vh-100 text-white"
      style={{
        width: '260px',
        minWidth: '260px',
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        boxShadow: '2px 0 10px rgba(0,0,0,0.2)',
      }}
    >
      {/* ব্র্যান্ড / লোগো */}
      <div className="text-center py-4 border-bottom border-light border-opacity-10">
        <h4 className="fw-bold mb-0">
          <span className="text-primary">💰</span> Pocket Hisaab
        </h4>
        <small className="text-white-50">Expense Tracker</small>
      </div>

      {/* ইউজার প্রোফাইল (ছোট) */}
      <div className="d-flex align-items-center px-3 py-3 border-bottom border-light border-opacity-10">
        <FaUserCircle size={36} className="text-primary me-2" />
        <div className="flex-grow-1">
          <div className="fw-semibold text-truncate" style={{ fontSize: '0.9rem' }}>
            {user?.name || 'User'}
          </div>
          <small className="text-white-50 text-truncate d-block" style={{ fontSize: '0.7rem' }}>
            {user?.email || 'user@example.com'}
          </small>
        </div>
      </div>

      {/* নেভিগেশন মেনু */}
      <Nav className="flex-column flex-grow-1 px-2 py-3">
        <Nav.Link 
          as={NavLink} 
          to="/dashboard" 
          className="sidebar-link"
          end
        >
          <FaHome className="me-2" /> Dashboard
        </Nav.Link>
        <Nav.Link 
          as={NavLink} 
          to="/transactions" 
          className="sidebar-link"
        >
          <FaMoneyBillWave className="me-2" /> Transactions
        </Nav.Link>
        <Nav.Link 
          as={NavLink} 
          to="/categories" 
          className="sidebar-link"
        >
          <FaTags className="me-2" /> Categories
        </Nav.Link>
        <Nav.Link 
          as={NavLink} 
          to="/accounts" 
          className="sidebar-link"
        >
          <FaWallet className="me-2" /> Accounts
        </Nav.Link>
        <Nav.Link 
          as={NavLink} 
          to="/budgets" 
          className="sidebar-link"
        >
          <FaChartPie className="me-2" /> Budgets
        </Nav.Link>
      </Nav>

      {/* লগআউট বাটন */}
      <div className="p-3 border-top border-light border-opacity-10">
        <Nav.Link 
          onClick={logout} 
          className="sidebar-link text-danger"
          style={{ '--bs-nav-link-color': '#dc3545' }}
        >
          <FaSignOutAlt className="me-2" /> Logout
        </Nav.Link>
      </div>

      {/* কাস্টম স্টাইল (শুধু এই কম্পোনেন্টের জন্য) */}
      <style jsx>{`
        .sidebar-link {
          color: rgba(255,255,255,0.7) !important;
          padding: 10px 16px;
          border-radius: 8px;
          margin: 2px 0;
          transition: all 0.2s ease;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
        }
        .sidebar-link:hover {
          background: rgba(255,255,255,0.1);
          color: #fff !important;
          transform: translateX(4px);
        }
        .sidebar-link.active {
          background: rgba(13, 110, 253, 0.25);
          color: #fff !important;
          box-shadow: inset 3px 0 0 #0d6efd;
        }
        .sidebar-link.text-danger:hover {
          background: rgba(220, 53, 69, 0.15);
          color: #ff6b7a !important;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;