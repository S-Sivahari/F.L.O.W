import { apiRequest, toId, withAvatarInitials } from "./api.js";

function normalizeUser(user) {
  return withAvatarInitials({
    ...user,
    id: toId(user),
  });
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
