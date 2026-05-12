import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../shared/hooks/useAuth.js';
import { ROLES } from '../shared/constants/roles.js';

export default function PendingPage() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user has been assigned a role, redirect to dashboard
    if (role && role !== ROLES.PENDING) {
      navigate('/dashboard');
    }
  }, [role, navigate]);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: 420 }}>
        <div className="login-logo-block">
          <div className="login-logo">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <rect x="6" y="6" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="2"/>
              <circle cx="16" cy="16" r="3" fill="currentColor"/>
              <path d="M2 12h4M2 20h4M26 12h4M26 20h4M12 2v4M20 2v4M12 26v4M20 26v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>F.L.O.W</span>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ 
            width: 60, 
            height: 60, 
            margin: '0 auto 12px', 
            borderRadius: '50%',
            background: 'rgba(245, 158, 11, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32
          }}>
            ⏳
          </div>
          <h2 style={{ color: '#fff', marginBottom: 10, fontSize: 18 }}>
            Account Pending Approval
          </h2>
          <p style={{ color: '#b0b0b0', fontSize: 13, lineHeight: 1.5 }}>
            Welcome, <strong>{user?.name}</strong>!
          </p>
          <p style={{ color: '#b0b0b0', fontSize: 13, lineHeight: 1.5, marginTop: 6 }}>
            Your account has been created successfully, but you need to be assigned a role by an administrator before you can access the system.
          </p>
        </div>

        <div style={{ 
          background: 'rgba(245, 158, 11, 0.1)', 
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: 8,
          padding: 14,
          marginBottom: 16
        }}>
          <div style={{ fontSize: 12, color: '#d6dceb', lineHeight: 1.5 }}>
            <strong>What happens next?</strong>
            <ul style={{ marginTop: 6, paddingLeft: 18, marginBottom: 0 }}>
              <li>An administrator will review your account</li>
              <li>You'll be assigned a role (Admin, Manager, or Engineer)</li>
              <li>Once assigned, you can log in and access the system</li>
            </ul>
          </div>
        </div>

        <div style={{ fontSize: 11, color: '#8b95a7', textAlign: 'center', marginBottom: 14 }}>
          Please check back later or contact your administrator for more information.
        </div>

        <button
          className="btn btn-secondary"
          onClick={handleLogout}
          style={{ width: '100%' }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
