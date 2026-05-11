const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const DATA_CHANGE_EVENT = "flow:data-changed";

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

export function notifyDataChanged(detail = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(DATA_CHANGE_EVENT, {
      detail: {
        ...detail,
        occurredAt: new Date().toISOString(),
      },
    }),
  );
}

export function subscribeToDataChanges(listener) {
  if (typeof window === "undefined") return () => {};
  const wrapped = (event) => listener(event?.detail || {});
  window.addEventListener(DATA_CHANGE_EVENT, wrapped);
  return () => window.removeEventListener(DATA_CHANGE_EVENT, wrapped);
}

export async function apiRequest(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const response = await fetch(makeUrl(path), {
    credentials: "include",
    cache: "no-store",
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

  if (method !== "GET" && method !== "HEAD") {
    notifyDataChanged({ path, method });
  }

  return payload;
}
