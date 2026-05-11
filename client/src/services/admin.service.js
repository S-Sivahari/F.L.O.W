import { apiRequest, toId } from "./api.js";

export async function getLoginAttempts() {
  const attempts = await apiRequest("/api/auth/login-attempts");
  return attempts.map((attempt) => ({
    ...attempt,
    id: toId(attempt),
  }));
}

export async function bulkReassignEngineer(fromEngineerId, toEngineerId) {
  return apiRequest("/api/assignments/bulk-reassign", {
    method: "POST",
    body: JSON.stringify({ fromEngineerId, toEngineerId }),
  });
}

export async function forceBlockStage(blockId, payload) {
  return apiRequest(`/api/blocks/${blockId}/force-stage`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
