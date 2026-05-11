import { apiRequest, toId } from "./api.js";
import { getBlocks } from "./blocks.service.js";

/** @api GET /api/effort — Get effort estimates for all blocks */
export async function getEffortEstimates() {
  const blocks = await getBlocks();
  return blocks.map((b) => ({
    id: b.id,
    name: b.name,
    complexity: b.complexity,
    baseHours: b.baseHours,
    estimatedHours: b.estimatedHours,
    actualHours: b.actualHours || 0,
    overrideReason: b.overrideReason || null,
  }));
}

/** @api POST /api/effort/:blockId/override — Override estimated hours */
export async function overrideEffort(blockId, hours, reason) {
  const updated = await apiRequest(`/api/blocks/${blockId}/override-effort`, {
    method: "PUT",
    body: JSON.stringify({
      estimatedHours: Number(hours),
      overrideReason: reason,
    }),
  });
  return {
    ...updated,
    id: toId(updated),
  };
}
