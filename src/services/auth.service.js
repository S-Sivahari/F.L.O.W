import { mockUsers } from "../mock/mockUsers.js";

const delay = (v, ms = 300) => new Promise((r) => setTimeout(() => r(v), ms));

const SESSION_KEY = "layout_os_user";
const PROFILE_COLLECTION_KEY = "layout_os_user_profiles";
const GOOGLE_IDENTITY = {
  id: "google-user-1",
  name: "Avery Chen",
  email: "avery@layoutos.io",
  avatarInitials: "AC",
};

function readProfiles() {
  try {
    const raw = localStorage.getItem(PROFILE_COLLECTION_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeProfiles(profiles) {
  localStorage.setItem(PROFILE_COLLECTION_KEY, JSON.stringify(profiles));
}

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

/** @api POST /api/auth/google — Initiate Google OAuth */
export async function initiateGoogleLogin(role = "MANAGER") {
  const user =
    mockUsers.find((item) => item.role === role) ||
    mockUsers.find((item) => item.role === "ENGINEER") ||
    mockUsers[0];
  return delay({ ...user });
}

export async function getUserProfileByEmail(email) {
  const profile = readProfiles().find((item) => item.email === email) || null;
  return delay(profile);
}

export async function saveUserProfile(profile) {
  const nextProfile = {
    ...profile,
    id: profile.id || `profile-${Date.now()}`,
    avatarInitials:
      profile.avatarInitials ||
      makeAvatarInitials(profile.fullName || profile.name || profile.email),
    profileComplete: true,
    updatedAt: new Date().toISOString(),
  };

  const profiles = readProfiles();
  const existingIndex = profiles.findIndex(
    (item) => item.email === nextProfile.email,
  );
  if (existingIndex >= 0) {
    profiles[existingIndex] = { ...profiles[existingIndex], ...nextProfile };
  } else {
    profiles.push(nextProfile);
  }

  writeProfiles(profiles);
  localStorage.setItem(SESSION_KEY, JSON.stringify(nextProfile));
  return delay(nextProfile);
}

/** @api GET /api/auth/me — Get current authenticated user */
export async function getCurrentUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return delay(raw ? JSON.parse(raw) : null);
  } catch {
    return delay(null);
  }
}

/** @api POST /api/auth/logout — End session */
export async function logout() {
  localStorage.removeItem(SESSION_KEY);
  return delay(true);
}
