import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import Sidebar from './Sidebar.jsx';
import NotificationBell from './NotificationBell.jsx';
import useAuth from '../hooks/useAuth.js';

export default function PageWrapper({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarOpen && window.innerWidth <= 768) {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar && !sidebar.contains(event.target) && !event.target.closest('.mobile-menu-btn')) {
          setSidebarOpen(false);
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  }, [children]);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div 
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 90,
            display: 'none'
          }}
        />
      )}
      
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
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12
        }}>
          {/* Mobile menu button */}
          <button
            className="btn btn-ghost mobile-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ 
              display: 'none',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              fontSize: 13
            }}
            title={sidebarOpen ? "Close menu" : "Open menu"}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
            <NotificationBell />
            <button
              className="btn btn-ghost logout-btn"
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
        </div>
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
