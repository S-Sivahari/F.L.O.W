import { computeEstimatedHours } from '../shared/utils/complexity.js';

function build(o) {
  return {
    ...o,
    estimatedHours: computeEstimatedHours(o.baseHours, o.complexity),
    createdAt: o.createdAt || new Date(Date.now() - Math.random() * 1e10).toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export const mockBlocks = [
  // Not Started (2, unassigned)
  build({ id: 'b-1', name: 'BIAS_GEN_A', type: 'Current Mirror', description: 'Bias generator for ADC.', techNode: '65nm', complexity: 'Medium', baseHours: 20, actualHours: 0, estimatedArea: 1200, areaUnit: 'µm²', status: 'Not Started', assignedEngineerId: null }),
  build({ id: 'b-2', name: 'INV_CHAIN_X', type: 'Inverter', description: 'Drive chain for clock buffer.', techNode: '28nm', complexity: 'Simple', baseHours: 8, actualHours: 0, estimatedArea: 320, areaUnit: 'µm²', status: 'Not Started', assignedEngineerId: null }),

  // In Progress (3)
  build({ id: 'b-3', name: 'DIFF_PAIR_LV', type: 'Differential Pair', description: 'Low-voltage diff pair.', techNode: '45nm', complexity: 'Medium', baseHours: 20, actualHours: 14, estimatedArea: 850, areaUnit: 'µm²', status: 'In Progress', assignedEngineerId: 'u-eng-1' }),
  build({ id: 'b-4', name: 'BANDGAP_CORE', type: 'Bandgap Reference', description: 'Precision voltage reference.', techNode: '180nm', complexity: 'Critical', baseHours: 80, actualHours: 50, estimatedArea: 4200, areaUnit: 'µm²', status: 'In Progress', assignedEngineerId: 'u-eng-2' }),
  build({ id: 'b-5', name: 'OTA_HSWING', type: 'Operational Transconductance Amplifier (OTA)', description: 'High-swing OTA.', techNode: '65nm', complexity: 'Complex', baseHours: 40, actualHours: 22, estimatedArea: 2800, areaUnit: 'µm²', status: 'In Progress', assignedEngineerId: 'u-eng-3' }),

  // DRC (2)
  build({ id: 'b-6', name: 'CMIRROR_FB', type: 'Current Mirror', description: 'Cascoded current mirror.', techNode: '90nm', complexity: 'Medium', baseHours: 20, actualHours: 28, estimatedArea: 980, areaUnit: 'µm²', status: 'DRC', assignedEngineerId: 'u-eng-4' }),
  build({ id: 'b-7', name: 'INV_RING_OSC', type: 'Inverter', description: 'Ring oscillator stage.', techNode: '28nm', complexity: 'Simple', baseHours: 8, actualHours: 10, estimatedArea: 280, areaUnit: 'µm²', status: 'DRC', assignedEngineerId: 'u-eng-1' }),

  // LVS (2)
  build({ id: 'b-8', name: 'OTA_LP', type: 'Operational Transconductance Amplifier (OTA)', description: 'Low-power OTA.', techNode: '65nm', complexity: 'Complex', baseHours: 40, actualHours: 95, estimatedArea: 2400, areaUnit: 'µm²', status: 'LVS', assignedEngineerId: 'u-eng-5' }),
  build({ id: 'b-9', name: 'DIFF_PAIR_HV', type: 'Differential Pair', description: 'High-voltage tolerant diff pair.', techNode: '180nm', complexity: 'Complex', baseHours: 40, actualHours: 88, estimatedArea: 1600, areaUnit: 'µm²', status: 'LVS', assignedEngineerId: 'u-eng-2' }),

  // Review (2)
  build({ id: 'b-10', name: 'BANDGAP_TRIM', type: 'Bandgap Reference', description: 'Trim circuit for bandgap.', techNode: '90nm', complexity: 'Critical', baseHours: 80, actualHours: 310, estimatedArea: 5200, areaUnit: 'µm²', status: 'Review', assignedEngineerId: 'u-eng-3' }),
  build({ id: 'b-11', name: 'CMIRROR_PRECISION', type: 'Current Mirror', description: 'Precision matched current mirror.', techNode: '45nm', complexity: 'Complex', baseHours: 40, actualHours: 102, estimatedArea: 1100, areaUnit: 'µm²', status: 'Review', assignedEngineerId: 'u-eng-4' }),

  // Completed (1)
  build({ id: 'b-12', name: 'INV_LVL_SHIFT', type: 'Inverter', description: 'Level shifter inverter.', techNode: '28nm', complexity: 'Simple', baseHours: 8, actualHours: 9, estimatedArea: 240, areaUnit: 'µm²', status: 'Completed', assignedEngineerId: 'u-eng-1' }),
];
