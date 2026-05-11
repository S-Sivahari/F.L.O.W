import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Menu } from 'lucide-react';
import useAuth from '../hooks/useAuth.js';
import { ROLE_LABELS, ROLES } from '../constants/roles.js';

const TITLES = {
  '/dashboard': 'Dashboard',
  '/blocks': 'Layout Blocks',
  '/effort': 'Effort Estimation',
  '/assignments': 'Resource Assignments',
  '/workflow': 'Workflow Board',
  '/approvals': 'Approvals',
};

export default function Topbar({ onMenuClick }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();
  const title = TITLES[pathname] || 'LayoutOS';
  const pendingCount = 0;
  const showBell = role === ROLES.MANAGER || role === ROLES.ADMIN;

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn-ghost" onClick={onMenuClick} style={{ padding: 6 }}>
          <Menu size={18} />
        </button>
        <div className="topbar-title">{title}</div>
      </div>
      <div className="topbar-right">
        {showBell && (
          <div style={{ position: 'relative' }}>
            <Bell size={18} color="var(--text-secondary)" />
            {pendingCount > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -6, background: 'var(--accent-warning)',
                color: '#fff', fontSize: 10, padding: '1px 5px', borderRadius: 999, fontWeight: 600,
              }}>{pendingCount}</span>
            )}
          </div>
        )}
        {user && (
          <>
            <div className="avatar avatar-sm">{user.avatarInitials}</div>
            <span className="role-badge">{ROLE_LABELS[role]}</span>
            <button className="btn btn-ghost" onClick={handleLogout} title="Logout">
              <LogOut size={16} />
            </button>
          </>
        )}
      </div>
    </header>
  );
}
