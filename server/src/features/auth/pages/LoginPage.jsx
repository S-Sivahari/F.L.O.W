import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../../shared/hooks/useAuth.js";
import {
  initiateGoogleLogin,
  saveUserProfile,
} from "../../../services/auth.service.js";
import { ROLES } from "../../../shared/constants/roles.js";
import GoogleSignInButton from "../components/GoogleSignInButton.jsx";
import RegistrationModal from "../components/RegistrationModal.jsx";

function makeAvatarInitials(name) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "FU"
  );
}

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState(ROLES.MANAGER);
  const [busy, setBusy] = useState(false);
  const [registrationBusy, setRegistrationBusy] = useState(false);
  const [googleUser, setGoogleUser] = useState(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSignIn() {
    setBusy(true);
    const identity = await initiateGoogleLogin(selectedRole);
    login(identity);
    navigate("/dashboard");
    setBusy(false);
  }

  async function handleRegister(values) {
    setRegistrationBusy(true);
    const savedProfile = await saveUserProfile({
      ...values,
      name: values.fullName,
      avatarInitials: makeAvatarInitials(values.fullName),
      googleName: googleUser?.name || values.fullName,
      googleEmail: googleUser?.email || values.email,
    });
    login(savedProfile);
    setRegisterOpen(false);
    setRegistrationBusy(false);
    navigate("/dashboard");
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo-block">
          <div className="login-logo">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <rect
                x="6"
                y="6"
                width="20"
                height="20"
                rx="2"
                stroke="var(--accent-primary)"
                strokeWidth="2"
              />
              <circle cx="16" cy="16" r="3" fill="var(--accent-primary)" />
              <path
                d="M2 12h4M2 20h4M26 12h4M26 20h4M12 2v4M20 2v4M12 26v4M20 26v4"
                stroke="var(--accent-primary)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span>F.L.O.W</span>
          </div>
          <p className="login-subtitle">
            Framework for Layout Optimization &amp; Workflow
          </p>
        </div>

        <div className="login-role-picker" aria-label="Role selection">
          <button
            type="button"
            className={`role-chip ${selectedRole === ROLES.ADMIN ? "active" : ""}`}
            onClick={() => setSelectedRole(ROLES.ADMIN)}
          >
            Admin
          </button>
          <button
            type="button"
            className={`role-chip ${selectedRole === ROLES.MANAGER ? "active" : ""}`}
            onClick={() => setSelectedRole(ROLES.MANAGER)}
          >
            Manager
          </button>
          <button
            type="button"
            className={`role-chip ${selectedRole === ROLES.ENGINEER ? "active" : ""}`}
            onClick={() => setSelectedRole(ROLES.ENGINEER)}
          >
            Engineer
          </button>
        </div>

        <GoogleSignInButton onClick={handleSignIn} disabled={busy} />

        <button
          className="register-link"
          type="button"
          onClick={() => setRegisterOpen(true)}
        >
          New user? Register here
        </button>

        <RegistrationModal
          isOpen={registerOpen}
          googleUser={googleUser}
          initialRole={selectedRole}
          busy={registrationBusy}
          onClose={() => setRegisterOpen(false)}
          onSubmit={handleRegister}
        />
      </div>
    </div>
  );
}
