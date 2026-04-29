export const STAGES = [
  'Not Started',
  'In Progress',
  'DRC',
  'LVS',
  'Review',
  'Completed',
];

export const STAGE_COLORS = {
  'Not Started': 'var(--stage-not-started)',
  'In Progress': 'var(--stage-in-progress)',
  'DRC': 'var(--stage-drc)',
  'LVS': 'var(--stage-lvs)',
  'Review': 'var(--stage-review)',
  'Completed': 'var(--stage-completed)',
};

export function nextStage(current) {
  const idx = STAGES.indexOf(current);
  if (idx < 0 || idx >= STAGES.length - 1) return null;
  return STAGES[idx + 1];
}
