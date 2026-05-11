import { mockAssignments } from '../mock/mockAssignments.js';
import { mockUsers, MAX_BLOCKS_PER_ENGINEER } from '../mock/mockUsers.js';
import { _getAllBlocks, _mutateBlock } from './blocks.service.js';

let assignments = [...mockAssignments];
const delay = (v, ms = 300) => new Promise((r) => setTimeout(() => r(v), ms));

/** @api GET /api/assignments — List engineer-block assignments */
export async function getAssignments() {
  return delay([...assignments]);
}

/** @api POST /api/assignments — Assign engineer to a block */
export async function assignEngineer(blockId, engineerId) {
  const count = assignments.filter((a) => a.engineerId === engineerId).length;
  if (count >= MAX_BLOCKS_PER_ENGINEER) throw new Error('Engineer at full capacity');
  // remove any prior assignment for this block
  assignments = assignments.filter((a) => a.blockId !== blockId);
  const a = { id: crypto.randomUUID(), blockId, engineerId, assignedAt: new Date().toISOString() };
  assignments.push(a);
  _mutateBlock(blockId, { assignedEngineerId: engineerId });
  return delay(a);
}

/** @api DELETE /api/assignments/:id — Unassign an engineer from a block */
export async function unassign(blockId) {
  assignments = assignments.filter((a) => a.blockId !== blockId);
  _mutateBlock(blockId, { assignedEngineerId: null });
  return delay(true);
}

export function getEngineerLoad(engineerId) {
  return assignments.filter((a) => a.engineerId === engineerId).length;
}

export function getEngineers() {
  return mockUsers.filter((u) => u.role === 'ENGINEER');
}

export { MAX_BLOCKS_PER_ENGINEER };
