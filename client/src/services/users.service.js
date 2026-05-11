import { apiRequest, toId, withAvatarInitials } from "./api.js";

function normalizeUser(user) {
  return withAvatarInitials({
    ...user,
    id: toId(user),
  });
}

export async function upsertUser({ email, name, role, skills }) {
  const response = await apiRequest("/api/users/upsert", {
    method: "POST",
    body: JSON.stringify({ email, name, role, skills }),
  });
  return {
    action: response.action,
    user: normalizeUser(response.user),
  };
}

export async function getUsers() {
  const users = await apiRequest("/api/users");
  return users.map(normalizeUser);
}

export async function setUserActive(userId, active) {
  const updated = await apiRequest(`/api/users/${userId}/active`, {
    method: "PATCH",
    body: JSON.stringify({ active }),
  });
  return normalizeUser(updated);
}

export async function updateUserRole(userId, role) {
  const updated = await apiRequest(`/api/users/${userId}/role`, {
    method: "PUT",
    body: JSON.stringify({ role }),
  });
  return normalizeUser(updated);
}

export async function updateUserSkills(userId, skills) {
  const updated = await apiRequest(`/api/users/${userId}/skills`, {
    method: "PUT",
    body: JSON.stringify({ skills }),
  });
  return normalizeUser(updated);
}

export async function enableEngineerAccess({ email, name }) {
  const response = await apiRequest("/api/users/engineers/enable", {
    method: "POST",
    body: JSON.stringify({ email, name }),
  });
  return {
    action: response.action,
    user: normalizeUser(response.user),
  };
}
