import { mockApprovals } from '../mock/mockApprovals.js';
import { _mutateBlock } from './blocks.service.js';
import { _addLog } from './workflow.service.js';

let approvals = [...mockApprovals];
const delay = (v, ms = 300) => new Promise((r) => setTimeout(() => r(v), ms));

/** @api GET /api/approvals — List approval records */
export async function getApprovals() {
  return delay([...approvals]);
}

/** @api POST /api/approvals — Submit block for review */
export async function submitForReview(blockId, engineerId) {
  approvals = approvals.filter((a) => !(a.blockId === blockId && a.status === 'Pending'));
  const a = {
    id: crypto.randomUUID(), blockId, engineerId,
    submittedAt: new Date().toISOString(), status: 'Pending',
    comment: null, reviewedBy: null, reviewedAt: null,
  };
  approvals.push(a);
  _mutateBlock(blockId, { status: 'Review' });
  _addLog({ blockId, stage: 'Review', actorId: engineerId, timestamp: new Date().toISOString() });
  return delay(a);
}

/** @api POST /api/approvals/:id/approve — Approve a block */
export async function approveBlock(approvalId, managerId) {
  approvals = approvals.map((a) => a.id === approvalId ? {
    ...a, status: 'Approved', reviewedBy: managerId, reviewedAt: new Date().toISOString(),
  } : a);
  const ap = approvals.find((a) => a.id === approvalId);
  _mutateBlock(ap.blockId, { status: 'Completed' });
  _addLog({ blockId: ap.blockId, stage: 'Completed', actorId: managerId, timestamp: new Date().toISOString(), comment: 'Approved.' });
  return delay(ap);
}

/** @api POST /api/approvals/:id/reject — Reject a block with comment */
export async function rejectBlock(approvalId, managerId, comment) {
  approvals = approvals.map((a) => a.id === approvalId ? {
    ...a, status: 'Rejected', comment, reviewedBy: managerId, reviewedAt: new Date().toISOString(),
  } : a);
  const ap = approvals.find((a) => a.id === approvalId);
  _mutateBlock(ap.blockId, { status: 'In Progress' });
  _addLog({ blockId: ap.blockId, stage: 'In Progress', actorId: managerId, timestamp: new Date().toISOString(), comment: `Rejected: ${comment}` });
  return delay(ap);
}
