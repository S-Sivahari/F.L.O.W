import { COMPLEXITY_FACTORS, COMPLEXITY_BASE_HOURS } from '../constants/complexity.js';

export function computeEstimatedHours(baseHours, complexity) {
  const factor = COMPLEXITY_FACTORS[complexity] ?? 1;
  const base = baseHours ?? COMPLEXITY_BASE_HOURS[complexity] ?? 8;
  return Math.round(base * factor);
}

export function getFactor(complexity) {
  return COMPLEXITY_FACTORS[complexity] ?? 1;
}
