import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import useAuth from '../hooks/useAuth.js';

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
  const { logout } = useAuth();
  const title = TITLES[pathname] || 'F.L.O.W';

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="topbar-title">{title}</div>
      </div>
      <div className="topbar-right">
        <button className="btn btn-ghost" onClick={handleLogout} title="Logout">
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
