function ts(daysAgo, h = 10) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(h, Math.floor(Math.random() * 60), 0, 0);
  return d.toISOString();
}

export const mockWorkflowLogs = [
  { id: 'l-1', blockId: 'b-3', stage: 'Not Started', actorId: 'u-mgr-1', timestamp: ts(8) },
  { id: 'l-2', blockId: 'b-3', stage: 'In Progress', actorId: 'u-eng-1', timestamp: ts(7) },
  { id: 'l-3', blockId: 'b-4', stage: 'Not Started', actorId: 'u-mgr-1', timestamp: ts(12) },
  { id: 'l-4', blockId: 'b-4', stage: 'In Progress', actorId: 'u-eng-2', timestamp: ts(10) },
  { id: 'l-5', blockId: 'b-6', stage: 'In Progress', actorId: 'u-eng-4', timestamp: ts(9) },
  { id: 'l-6', blockId: 'b-6', stage: 'DRC', actorId: 'u-eng-4', timestamp: ts(5) },
  { id: 'l-7', blockId: 'b-7', stage: 'In Progress', actorId: 'u-eng-1', timestamp: ts(6) },
  { id: 'l-8', blockId: 'b-7', stage: 'DRC', actorId: 'u-eng-1', timestamp: ts(3) },
  { id: 'l-9', blockId: 'b-8', stage: 'DRC', actorId: 'u-eng-5', timestamp: ts(4) },
  { id: 'l-10', blockId: 'b-8', stage: 'LVS', actorId: 'u-eng-5', timestamp: ts(2) },
  { id: 'l-11', blockId: 'b-10', stage: 'LVS', actorId: 'u-eng-3', timestamp: ts(3) },
  { id: 'l-12', blockId: 'b-10', stage: 'Review', actorId: 'u-eng-3', timestamp: ts(1, 14) },
  { id: 'l-13', blockId: 'b-11', stage: 'LVS', actorId: 'u-eng-4', timestamp: ts(2) },
  { id: 'l-14', blockId: 'b-11', stage: 'Review', actorId: 'u-eng-4', timestamp: ts(1, 9) },
  { id: 'l-15', blockId: 'b-12', stage: 'Review', actorId: 'u-eng-1', timestamp: ts(4) },
  { id: 'l-16', blockId: 'b-12', stage: 'Completed', actorId: 'u-mgr-1', timestamp: ts(3, 11), comment: 'Approved for tape-out.' },
];
