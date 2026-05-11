import { _mutateBlock, _getAllBlocks } from './blocks.service.js';

const delay = (v, ms = 300) => new Promise((r) => setTimeout(() => r(v), ms));

/** @api GET /api/dependencies — Get all block dependencies */
export async function getDependencies() {
  const blocks = _getAllBlocks();
  const deps = {};
  blocks.forEach((b) => {
    deps[b.id] = b.dependsOn || [];
  });
  return delay(deps);
}

/** @api GET /api/dependencies/:blockId — Get dependencies for a specific block */
export async function getBlockDependencies(blockId) {
  const blocks = _getAllBlocks();
  const block = blocks.find((b) => b.id === blockId);
  if (!block) return delay(null);
  return delay(block.dependsOn || []);
}

/** Get blocks that depend on a given block (reverse dependencies) */
export async function getBlockDependents(blockId) {
  const blocks = _getAllBlocks();
  const dependents = blocks
    .filter((b) => (b.dependsOn || []).includes(blockId))
    .map((b) => b.id);
  return delay(dependents);
}

/** Check if adding a dependency would create a cycle */
export function wouldCreateCycle(sourceId, targetId) {
  const blocks = _getAllBlocks();
  
  const visited = new Set();
  const recursionStack = new Set();
  
  function hasCycleDFS(nodeId) {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    
    const node = blocks.find((b) => b.id === nodeId);
    const deps = (node?.dependsOn || []);
    
    for (const depId of deps) {
      if (!visited.has(depId)) {
        if (hasCycleDFS(depId)) return true;
      } else if (recursionStack.has(depId)) {
        return true;
      }
    }
    
    recursionStack.delete(nodeId);
    return false;
  }
  
  // Simulate adding edge from sourceId to targetId
  // Would create cycle if targetId can reach sourceId
  const target = blocks.find((b) => b.id === targetId);
  const targetDeps = (target?.dependsOn || []);
  if (targetDeps.includes(sourceId)) return true;
  
  // Check if sourceId is already reachable from targetId
  const visited2 = new Set();
  function canReach(from, to) {
    if (from === to) return true;
    if (visited2.has(from)) return false;
    visited2.add(from);
    
    const fromNode = blocks.find((b) => b.id === from);
    for (const depId of (fromNode?.dependsOn || [])) {
      if (canReach(depId, to)) return true;
    }
    return false;
  }
  
  return canReach(targetId, sourceId);
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
  
  const blocks = _getAllBlocks();
  const block = blocks.find((b) => b.id === blockId);
  
  if (!block) {
    throw new Error('Block not found');
  }
  
  const deps = block.dependsOn || [];
  if (deps.includes(dependsOnId)) {
    throw new Error('This dependency already exists');
  }
  
  _mutateBlock(blockId, { dependsOn: [...deps, dependsOnId] });
  const updated = blocks.find((b) => b.id === blockId);
  return delay(updated);
}

/** @api DELETE /api/dependencies — Remove a dependency */
export async function removeDependency(blockId, dependsOnId) {
  const blocks = _getAllBlocks();
  const block = blocks.find((b) => b.id === blockId);
  
  if (!block) {
    throw new Error('Block not found');
  }
  
  const deps = block.dependsOn || [];
  const filtered = deps.filter((id) => id !== dependsOnId);
  
  if (filtered.length === deps.length) {
    throw new Error('This dependency does not exist');
  }
  
  _mutateBlock(blockId, { dependsOn: filtered });
  const updated = blocks.find((b) => b.id === blockId);
  return delay(updated);
}
