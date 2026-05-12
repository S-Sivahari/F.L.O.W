import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import Sidebar from './Sidebar.jsx';
import NotificationBell from './NotificationBell.jsx';
import useAuth from '../hooks/useAuth.js';

export default function PageWrapper({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} />
      <div className="app-main">
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 12
        }}>
          <NotificationBell />
          <button
            className="btn btn-ghost"
            onClick={handleLogout}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8,
              padding: '8px 12px',
              fontSize: 13
            }}
            title="Logout"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
