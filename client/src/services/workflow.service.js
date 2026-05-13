import { nextStage } from "../shared/constants/pipeline.js";
import { apiRequest, toId, withAvatarInitials } from "./api.js";
import { getBlocks } from "./blocks.service.js";

function normalizeWorkflowLog(log) {
  const actor = withAvatarInitials(log.performedBy);
  const stageFromAction = String(log.action || "").replace(
    /^Force stage:\s*/,
    "",
  );
  return {
    ...log,
    id: toId(log),
    blockId: toId(log.blockId),
    actorId: actor?.id || toId(log.performedBy),
    actorName: actor?.name || "System",
    stage: stageFromAction || "Updated",
    comment: log.details?.note || null,
  };
}

/** @api POST /api/approvals — Request stage advancement (creates approval request) */
export async function requestStageAdvancement(blockId, actorId, comment = null) {
  const blocks = await getBlocks();
  const block = blocks.find((b) => b.id === blockId);
  if (!block) throw new Error("Block not found");
  
  const next = nextStage(block.status);
  if (!next) throw new Error("Already at final stage");

  // Create approval request instead of directly advancing
  const approval = await apiRequest("/api/approvals", {
    method: "POST",
    body: JSON.stringify({
      blockId,
      requestedBy: actorId,
      currentStage: block.status,
      requestedStage: next,
      reason: comment,
    }),
  });

  return { blockId, currentStage: block.status, requestedStage: next, approvalId: approval._id };
}

/** @api GET /api/workflow/:blockId/log — Get workflow history for a block */
export async function getWorkflowLog(blockId) {
  const logs = await apiRequest(`/api/workflow-logs/block/${blockId}`);
  return logs
    .map(normalizeWorkflowLog)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}
