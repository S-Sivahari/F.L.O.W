import { apiRequest, toId, withAvatarInitials } from "./api.js";

function normalizeBlock(block) {
  const assignedEngineer = withAvatarInitials(block.assignedEngineerId);
  const dependencies = Array.isArray(block.dependsOn) ? block.dependsOn : [];
  return {
    ...block,
    id: toId(block),
    assignedEngineerId: assignedEngineer?.id || toId(block.assignedEngineerId),
    assignedEngineer,
    dependsOn: dependencies.map((dep) => toId(dep)).filter(Boolean),
    dependencyBlocks: dependencies.map((dep) => ({
      ...dep,
      id: toId(dep),
    })),
  };
}

/** @api GET /api/blocks — List all layout blocks */
export async function getBlocks() {
  const blocks = await apiRequest("/api/blocks");
  return blocks.map(normalizeBlock);
}

/** @api POST /api/blocks — Create a new layout block */
export async function createBlock(data) {
  const created = await apiRequest("/api/blocks", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return normalizeBlock(created);
}

/** @api PUT /api/blocks/:id — Update a layout block */
export async function updateBlock(id, data) {
  const updated = await apiRequest(`/api/blocks/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return normalizeBlock(updated);
}

/** @api DELETE /api/blocks/:id — Delete a layout block */
export async function deleteBlock(id) {
  await apiRequest(`/api/blocks/${id}`, { method: "DELETE" });
  return true;
}

/** Internal — used by other services to mutate block state */
export function _mutateBlock(id, patch) {
  return updateBlock(id, patch);
}

export async function _getAllBlocks() {
  return getBlocks();
}
