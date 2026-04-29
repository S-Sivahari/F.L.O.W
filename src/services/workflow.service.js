import { mockWorkflowLogs } from '../mock/mockWorkflowLogs.js';
import { _getAllBlocks, _mutateBlock } from './blocks.service.js';
import { nextStage } from '../shared/constants/pipeline.js';

let logs = [...mockWorkflowLogs];
const delay = (v, ms = 300) => new Promise((r) => setTimeout(() => r(v), ms));

/** @api POST /api/workflow/:blockId/advance — Advance block to next stage */
export async function advanceStage(blockId, actorId, comment = null) {
  const block = _getAllBlocks().find((b) => b.id === blockId);
  if (!block) throw new Error('Block not found');
  const next = nextStage(block.status);
  if (!next) throw new Error('Already at final stage');
  _mutateBlock(blockId, { status: next });
  logs.push({
    id: crypto.randomUUID(), blockId, stage: next, actorId,
    timestamp: new Date().toISOString(), comment,
  });
  return delay({ blockId, newStage: next });
}

/** @api GET /api/workflow/:blockId/log — Get workflow history for a block */
export async function getWorkflowLog(blockId) {
  return delay(logs.filter((l) => l.blockId === blockId).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
}

export function _addLog(entry) {
  logs.push({ id: crypto.randomUUID(), ...entry });
}
