import { mockUsers } from '../mock/mockUsers.js';

const delay = (v, ms = 300) => new Promise((r) => setTimeout(() => r(v), ms));

/** @api POST /api/auth/google — Initiate Google OAuth */
export async function initiateGoogleLogin(role = 'ENGINEER') {
  const user = mockUsers.find((u) => u.role === role) || mockUsers[0];
  return delay(user);
}

/** @api GET /api/auth/me — Get current authenticated user */
export async function getCurrentUser() {
  try {
    const raw = localStorage.getItem('layout_os_user');
    return delay(raw ? JSON.parse(raw) : null);
  } catch { return delay(null); }
}

/** @api POST /api/auth/logout — End session */
export async function logout() {
  localStorage.removeItem('layout_os_user');
  return delay(true);
}
