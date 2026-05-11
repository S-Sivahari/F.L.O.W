import { getBlocks, updateBlock } from "./blocks.service.js";

/** @api GET /api/dependencies — Get all block dependencies */
export async function getDependencies() {
  const blocks = await getBlocks();
  const deps = {};
  blocks.forEach((b) => {
    deps[b.id] = b.dependsOn || [];
  });
  return deps;
}

/** @api GET /api/dependencies/:blockId — Get dependencies for a specific block */
export async function getBlockDependencies(blockId) {
  const blocks = await getBlocks();
  const block = blocks.find((b) => b.id === blockId);
  if (!block) return null;
  return block.dependsOn || [];
}

/** Get blocks that depend on a given block (reverse dependencies) */
export async function getBlockDependents(blockId) {
  const blocks = await getBlocks();
  const dependents = blocks
    .filter((b) => (b.dependsOn || []).includes(blockId))
    .map((b) => b.id);
  return dependents;
}

/** Check if adding a dependency would create a cycle */
export function wouldCreateCycle(sourceId, targetId) {
  return sourceId === targetId;
}

/** @api POST /api/dependencies — Add a dependency */
export async function addDependency(blockId, dependsOnId) {
  // Validation
  if (blockId === dependsOnId) {
    throw new Error('A block cannot depend on itself');
  }
  
  if (wouldCreateCycle(blockId, dependsOnId)) {
    throw new Error('Adding this dependency would create a cycle');
  }
  
  const blocks = await getBlocks();
  const block = blocks.find((b) => b.id === blockId);
  
  if (!block) {
    throw new Error('Block not found');
  }
  
  const deps = block.dependsOn || [];
  if (deps.includes(dependsOnId)) {
    throw new Error('This dependency already exists');
  }
  
  return updateBlock(blockId, { dependsOn: [...deps, dependsOnId] });
}

/** @api DELETE /api/dependencies — Remove a dependency */
export async function removeDependency(blockId, dependsOnId) {
  const blocks = await getBlocks();
  const block = blocks.find((b) => b.id === blockId);
  
  if (!block) {
    throw new Error('Block not found');
  }
  
  const deps = block.dependsOn || [];
  const filtered = deps.filter((id) => id !== dependsOnId);
  
  if (filtered.length === deps.length) {
    throw new Error('This dependency does not exist');
  }
  
  return updateBlock(blockId, { dependsOn: filtered });
}
