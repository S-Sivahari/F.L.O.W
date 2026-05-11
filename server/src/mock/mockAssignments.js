import { mockBlocks } from './mockBlocks.js';

export const mockAssignments = mockBlocks
  .filter((b) => b.assignedEngineerId)
  .map((b) => ({
    id: `a-${b.id}`,
    blockId: b.id,
    engineerId: b.assignedEngineerId,
    assignedAt: new Date(Date.now() - Math.random() * 5e9).toISOString(),
  }));
