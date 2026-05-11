import { _getAllBlocks, _mutateBlock } from './blocks.service.js';
import { computeEstimatedHours } from '../shared/utils/complexity.js';

const delay = (v, ms = 300) => new Promise((r) => setTimeout(() => r(v), ms));

/** @api GET /api/effort — Get effort estimates for all blocks */
export async function getEffortEstimates() {
  const data = _getAllBlocks().map((b) => ({
    id: b.id,
    name: b.name,
    complexity: b.complexity,
    baseHours: b.baseHours,
    estimatedHours: b.estimatedHours ?? computeEstimatedHours(b.baseHours, b.complexity),
    actualHours: b.actualHours || 0,
    overrideReason: b.overrideReason || null,
  }));
  return delay(data);
}

/** @api POST /api/effort/:blockId/override — Override estimated hours */
export async function overrideEffort(blockId, hours, reason) {
  const updated = _mutateBlock(blockId, { estimatedHours: Number(hours), overrideReason: reason });
  return delay(updated);
}
