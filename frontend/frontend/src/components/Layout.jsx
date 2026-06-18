import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  return (
    <div className="d-flex vh-100 overflow-hidden">
      <Sidebar />
      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        <Header />
        <main className="flex-grow-1 overflow-auto p-4" style={{ background: '#f0f2f5' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;