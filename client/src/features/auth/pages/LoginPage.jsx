import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { initiateGoogleLogin } from "../../../services/auth.service.js";
import GoogleSignInButton from "../components/GoogleSignInButton.jsx";

export default function LoginPage() {
  const [busy, setBusy] = useState(false);
  const [searchParams] = useSearchParams();
  const isUnauthorized = searchParams.get("error") === "unauthorized";

  async function handleSignIn() {
    setBusy(true);
    await initiateGoogleLogin();
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

        {isUnauthorized && (
          <div className="form-hint" style={{ marginBottom: 12, color: "var(--accent-danger)" }}>
            This Google account is not authorized. Contact admin to enable access.
          </div>
        )}
        <GoogleSignInButton onClick={handleSignIn} disabled={busy} />
      </div>
    </div>
  );
}
