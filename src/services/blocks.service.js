import { mockBlocks } from '../mock/mockBlocks.js';
import { computeEstimatedHours } from '../shared/utils/complexity.js';

let blocks = [...mockBlocks];
const delay = (v, ms = 300) => new Promise((r) => setTimeout(() => r(v), ms));

/** @api GET /api/blocks — List all layout blocks */
export async function getBlocks() {
  return delay([...blocks]);
}

/** @api POST /api/blocks — Create a new layout block */
export async function createBlock(data) {
  const newBlock = {
    id: crypto.randomUUID(),
    ...data,
    estimatedHours: computeEstimatedHours(data.baseHours, data.complexity),
    actualHours: 0,
    status: 'Not Started',
    assignedEngineerId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  blocks.push(newBlock);
  return delay(newBlock);
}

/** @api PUT /api/blocks/:id — Update a layout block */
export async function updateBlock(id, data) {
  blocks = blocks.map((b) => b.id === id ? {
    ...b, ...data,
    estimatedHours: computeEstimatedHours(data.baseHours ?? b.baseHours, data.complexity ?? b.complexity),
    updatedAt: new Date().toISOString(),
  } : b);
  return delay(blocks.find((b) => b.id === id));
}

/** @api DELETE /api/blocks/:id — Delete a layout block */
export async function deleteBlock(id) {
  blocks = blocks.filter((b) => b.id !== id);
  return delay(true);
}

/** Internal — used by other services to mutate block state */
export function _mutateBlock(id, patch) {
  blocks = blocks.map((b) => b.id === id ? { ...b, ...patch, updatedAt: new Date().toISOString() } : b);
  return blocks.find((b) => b.id === id);
}

export function _getAllBlocks() { return blocks; }
