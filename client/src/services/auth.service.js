import { apiRequest, toId, withAvatarInitials } from "./api.js";

/** @api POST /api/auth/google — Initiate Google OAuth */
export async function initiateGoogleLogin() {
  const base = import.meta.env.VITE_API_BASE_URL || "";
  window.location.href = `${base}/api/auth/google`;
}

export async function getUserProfileByEmail(email) {
  const users = await apiRequest("/api/users");
  const normalized = String(email || "").trim().toLowerCase();
  const found = users.find((u) => String(u.email || "").toLowerCase() === normalized);
  return found
    ? withAvatarInitials({
        ...found,
        id: toId(found),
      })
    : null;
}

export async function saveUserProfile(profile) {
  const payload = {
    email: profile.email,
    name: profile.fullName || profile.name,
    role: profile.role || "ENGINEER",
  };
  const created = await apiRequest("/api/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return withAvatarInitials({
    ...created,
    id: toId(created),
  });
}

/** @api GET /api/auth/me — Get current authenticated user */
export async function getCurrentUser() {
  try {
    const user = await apiRequest("/api/auth/me");
    return withAvatarInitials({
      ...user,
      id: toId(user),
    });
  } catch {
    return null;
  }
}

/** @api POST /api/auth/logout — End session */
export async function logout() {
  await apiRequest("/api/auth/logout", {
    method: "POST",
  });
  return true;
}
