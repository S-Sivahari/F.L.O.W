import { NavLink } from 'react-router-dom';
import {
  LayoutGrid, Layers, Clock, Trello,
} from 'lucide-react';
import useAuth from '../hooks/useAuth.js';
import { canAccess } from '../utils/roleGuard.js';
import { ROLE_LABELS } from '../constants/roles.js';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid, action: 'view:dashboard' },
  { to: '/blocks', label: 'Layout Blocks', icon: Layers, action: 'view:blocks' },
  { to: '/effort', label: 'Effort Estimation', icon: Clock, action: 'view:effort' },
  { to: '/workflow', label: 'Workflow Board', icon: Trello, action: 'view:workflow' },
];

export default function Sidebar({ open }) {
  const { user, role } = useAuth();
  const links = NAV.filter((n) => canAccess(role, n.action));

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
          <rect x="6" y="6" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="2"/>
          <circle cx="16" cy="16" r="3" fill="currentColor"/>
          <path d="M2 12h4M2 20h4M26 12h4M26 20h4M12 2v4M20 2v4M12 26v4M20 26v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span>F.L.O.W</span>
      </div>
      <nav className="sidebar-nav">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      {user && (
        <div className="sidebar-user">
          <div className="avatar">{user.avatarInitials}</div>
          <div className="sidebar-user-info" style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600 }}>{user.name}</div>
            <div className="role-badge" style={{ marginTop: 2 }}>{ROLE_LABELS[role]}</div>
          </div>
        </div>
      )}
    </aside>
  );
}
