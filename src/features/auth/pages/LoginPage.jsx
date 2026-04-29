import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../../shared/hooks/useAuth.js';
import { initiateGoogleLogin } from '../../../services/auth.service.js';
import { ROLES, ROLE_LABELS } from '../../../shared/constants/roles.js';
import GoogleSignInButton from '../components/GoogleSignInButton.jsx';

export default function LoginPage() {
  const [role, setRole] = useState(ROLES.MANAGER);
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSignIn() {
    setBusy(true);
    const user = await initiateGoogleLogin(role);
    login(user);
    setBusy(false);
    navigate('/dashboard');
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect x="6" y="6" width="20" height="20" rx="2" stroke="var(--accent-primary)" strokeWidth="2"/>
            <circle cx="16" cy="16" r="3" fill="var(--accent-primary)"/>
            <path d="M2 12h4M2 20h4M26 12h4M26 20h4M12 2v4M20 2v4M12 26v4M20 26v4" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          LayoutOS
        </div>
        <p className="login-tagline">Analog Layout Workflow Automation for IC Design Teams</p>

        <GoogleSignInButton onClick={handleSignIn} disabled={busy} />

        <div className="dev-panel">
          <div className="dev-panel-label">⚠ DEV: Switch Role</div>
          <div className="dev-role-buttons">
            {Object.values(ROLES).map((r) => (
              <button key={r} className={`dev-role-btn ${role === r ? 'active' : ''}`} onClick={() => setRole(r)}>
                {ROLE_LABELS[r]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
