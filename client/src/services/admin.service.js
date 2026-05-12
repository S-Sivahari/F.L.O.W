import { apiRequest, toId } from "./api.js";

export async function getLoginAttempts() {
  const attempts = await apiRequest("/api/admin/login-attempts");
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
  return apiRequest("/api/admin/force-block-stage", {
    method: "POST",
    body: JSON.stringify({ blockId, ...payload }),
  });
}

export async function triggerCleanup() {
  return apiRequest("/api/admin/cleanup-completed-blocks", {
    method: "POST",
  });
}
