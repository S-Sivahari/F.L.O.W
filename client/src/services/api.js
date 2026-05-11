const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

function makeUrl(path) {
  return `${API_BASE_URL}${path}`;
}

export function toId(value) {
  return value?._id || value?.id || value || null;
}

export function withAvatarInitials(user) {
  if (!user) return null;
  const name = user.name || user.email || "";
  const avatarInitials =
    user.avatarInitials ||
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") ||
    "US";
  return {
    ...user,
    id: toId(user),
    avatarInitials,
  };
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(makeUrl(path), {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = payload?.error || payload?.message || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return payload;
}
