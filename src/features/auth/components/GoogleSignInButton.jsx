export default function GoogleSignInButton({ onClick, disabled }) {
  return (
    <button className="google-btn" onClick={onClick} disabled={disabled}>
      <svg width="18" height="18" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.3 29.2 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.7 6.5 29.1 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z"/>
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.7 6.9 29.1 5 24 5 16.3 5 9.7 9.3 6.3 14.7z"/>
        <path fill="#4CAF50" d="M24 43c5 0 9.6-1.9 13.1-5l-6-4.9c-2 1.3-4.4 2-7.1 2-5.1 0-9.5-3.2-11.2-7.7l-6.5 5C9.5 38.6 16.2 43 24 43z"/>
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.6l6 4.9c-.4.4 6.4-4.7 6.4-14.5 0-1.2-.1-2.3-.4-3.5z"/>
      </svg>
      {disabled ? 'Signing in…' : 'Sign in with Google'}
    </button>
  );
}
