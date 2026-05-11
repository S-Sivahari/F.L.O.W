import { apiRequest, toId, withAvatarInitials } from "./api.js";

function normalizeApproval(approval) {
  const requester = withAvatarInitials(approval.requestedBy);
  const reviewer = withAvatarInitials(approval.approvedBy);
  return {
    ...approval,
    id: toId(approval),
    blockId: toId(approval.blockId),
    engineerId: requester?.id || toId(approval.requestedBy),
    engineerName: requester?.name || "Engineer",
    reviewedBy: reviewer?.id || toId(approval.approvedBy),
    reviewerName: reviewer?.name || null,
    submittedAt: approval.requestedAt || approval.createdAt,
    reviewedAt: approval.processedAt || null,
    comment: approval.rejectionReason || approval.reason || null,
  };
}

/** @api GET /api/approvals — List approval records */
export async function getApprovals() {
  const approvals = await apiRequest("/api/approvals");
  return approvals.map(normalizeApproval);
}

/** @api POST /api/approvals — Submit block for review */
export async function submitForReview(blockId, engineerId) {
  const approval = await apiRequest("/api/approvals", {
    method: "POST",
    body: JSON.stringify({
      blockId,
      requestedBy: engineerId,
    }),
  });
  await apiRequest(`/api/blocks/${blockId}`, {
    method: "PUT",
    body: JSON.stringify({ status: "Review" }),
  });
  return normalizeApproval(approval);
}

/** @api POST /api/approvals/:id/approve — Approve a block */
export async function approveBlock(approvalId, managerId) {
  const approval = await apiRequest(`/api/approvals/${approvalId}/approve`, {
    method: "PUT",
    body: JSON.stringify({ approvedBy: managerId }),
  });
  const normalized = normalizeApproval(approval);
  await apiRequest(`/api/blocks/${normalized.blockId}`, {
    method: "PUT",
    body: JSON.stringify({ status: "Completed" }),
  });
  return normalized;
}

/** @api POST /api/approvals/:id/reject — Reject a block with comment */
export async function rejectBlock(approvalId, managerId, comment) {
  const approval = await apiRequest(`/api/approvals/${approvalId}/reject`, {
    method: "PUT",
    body: JSON.stringify({
      approvedBy: managerId,
      rejectionReason: comment,
    }),
  });
  const normalized = normalizeApproval(approval);
  await apiRequest(`/api/blocks/${normalized.blockId}`, {
    method: "PUT",
    body: JSON.stringify({ status: "In Progress" }),
  });
  return normalized;
}
