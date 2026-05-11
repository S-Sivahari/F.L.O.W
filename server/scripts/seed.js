import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Block from '../models/Block.js';
import Assignment from '../models/Assignment.js';
import { connectDB } from '../config/database.js';
import { computeEstimatedHours } from '../../src/shared/utils/complexity.js';

async function seedDatabase() {
  try {
    await connectDB();

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Block.deleteMany({}),
      Assignment.deleteMany({}),
    ]);

    console.log('✓ Cleared existing data');

    // Create users
    const users = await User.insertMany([
      {
        name: 'Avery Chen',
        email: 'avery@layoutos.io',
        role: 'ENGINEER',
      },
      {
        name: 'Jordan Smith',
        email: 'jordan@layoutos.io',
        role: 'ENGINEER',
      },
      {
        name: 'Taylor Brown',
        email: 'taylor@layoutos.io',
        role: 'ENGINEER',
      },
      {
        name: 'Morgan Lee',
        email: 'morgan@layoutos.io',
        role: 'ENGINEER',
      },
      {
        name: 'Casey Wang',
        email: 'casey@layoutos.io',
        role: 'ENGINEER',
      },
      {
        name: 'Manager Alice',
        email: 'manager@layoutos.io',
        role: 'MANAGER',
      },
      {
        name: 'Admin Bob',
        email: 'admin@layoutos.io',
        role: 'ADMIN',
      },
    ]);

    console.log('✓ Created 7 users');

    // Create blocks with proper references
    const blocksData = [
      // Not Started (2, unassigned)
      {
        name: 'BIAS_GEN_A',
        type: 'Current Mirror',
        description: 'Bias generator for ADC.',
        techNode: '65nm',
        complexity: 'Medium',
        baseHours: 20,
        actualHours: 0,
        estimatedArea: 1200,
        areaUnit: 'µm²',
        status: 'Not Started',
        assignedEngineerId: null,
        criticPath: true,
      },
      {
        name: 'INV_CHAIN_X',
        type: 'Inverter',
        description: 'Drive chain for clock buffer.',
        techNode: '28nm',
        complexity: 'Simple',
        baseHours: 8,
        actualHours: 0,
        estimatedArea: 320,
        areaUnit: 'µm²',
        status: 'Not Started',
        assignedEngineerId: null,
        criticPath: false,
      },
      // In Progress (3)
      {
        name: 'DIFF_PAIR_LV',
        type: 'Differential Pair',
        description: 'Low-voltage diff pair.',
        techNode: '45nm',
        complexity: 'Medium',
        baseHours: 20,
        actualHours: 14,
        estimatedArea: 850,
        areaUnit: 'µm²',
        status: 'In Progress',
        assignedEngineerId: users[0]._id,
        criticPath: true,
      },
      {
        name: 'BANDGAP_CORE',
        type: 'Bandgap Reference',
        description: 'Precision voltage reference.',
        techNode: '180nm',
        complexity: 'Critical',
        baseHours: 80,
        actualHours: 50,
        estimatedArea: 4200,
        areaUnit: 'µm²',
        status: 'In Progress',
        assignedEngineerId: users[1]._id,
        criticPath: true,
      },
      {
        name: 'OTA_HSWING',
        type: 'Operational Transconductance Amplifier (OTA)',
        description: 'High-swing OTA.',
        techNode: '65nm',
        complexity: 'Complex',
        baseHours: 40,
        actualHours: 22,
        estimatedArea: 2800,
        areaUnit: 'µm²',
        status: 'In Progress',
        assignedEngineerId: users[2]._id,
        criticPath: false,
      },
      // DRC (2)
      {
        name: 'CMIRROR_FB',
        type: 'Current Mirror',
        description: 'Cascoded current mirror.',
        techNode: '90nm',
        complexity: 'Medium',
        baseHours: 20,
        actualHours: 28,
        estimatedArea: 980,
        areaUnit: 'µm²',
        status: 'DRC',
        assignedEngineerId: users[3]._id,
        criticPath: true,
      },
      {
        name: 'INV_RING_OSC',
        type: 'Inverter',
        description: 'Ring oscillator stage.',
        techNode: '28nm',
        complexity: 'Simple',
        baseHours: 8,
        actualHours: 10,
        estimatedArea: 280,
        areaUnit: 'µm²',
        status: 'DRC',
        assignedEngineerId: users[0]._id,
        criticPath: false,
      },
      // LVS (2)
      {
        name: 'OTA_LP',
        type: 'Operational Transconductance Amplifier (OTA)',
        description: 'Low-power OTA.',
        techNode: '65nm',
        complexity: 'Complex',
        baseHours: 40,
        actualHours: 95,
        estimatedArea: 2400,
        areaUnit: 'µm²',
        status: 'LVS',
        assignedEngineerId: users[4]._id,
        criticPath: true,
      },
      {
        name: 'DIFF_PAIR_HV',
        type: 'Differential Pair',
        description: 'High-voltage tolerant diff pair.',
        techNode: '180nm',
        complexity: 'Complex',
        baseHours: 40,
        actualHours: 88,
        estimatedArea: 1600,
        areaUnit: 'µm²',
        status: 'LVS',
        assignedEngineerId: users[1]._id,
        criticPath: false,
      },
      // Review (2)
      {
        name: 'BANDGAP_TRIM',
        type: 'Bandgap Reference',
        description: 'Trim circuit for bandgap.',
        techNode: '90nm',
        complexity: 'Critical',
        baseHours: 80,
        actualHours: 310,
        estimatedArea: 5200,
        areaUnit: 'µm²',
        status: 'Review',
        assignedEngineerId: users[2]._id,
        criticPath: true,
      },
      {
        name: 'CMIRROR_PRECISION',
        type: 'Current Mirror',
        description: 'Precision matched current mirror.',
        techNode: '45nm',
        complexity: 'Complex',
        baseHours: 40,
        actualHours: 102,
        estimatedArea: 1100,
        areaUnit: 'µm²',
        status: 'Review',
        assignedEngineerId: users[3]._id,
        criticPath: false,
      },
      // Completed (1)
      {
        name: 'INV_LVL_SHIFT',
        type: 'Inverter',
        description: 'Level shifter inverter.',
        techNode: '28nm',
        complexity: 'Simple',
        baseHours: 8,
        actualHours: 9,
        estimatedArea: 240,
        areaUnit: 'µm²',
        status: 'Completed',
        assignedEngineerId: users[0]._id,
        criticPath: false,
      },
    ];

    // Add estimated hours to all blocks
    const blocksWithEstimates = blocksData.map((b) => ({
      ...b,
      estimatedHours: computeEstimatedHours(b.baseHours, b.complexity),
    }));

    const blocks = await Block.insertMany(blocksWithEstimates);
    console.log('✓ Created 12 blocks');

    // Create assignments
    const assignments = [];
    for (const block of blocks) {
      if (block.assignedEngineerId) {
        assignments.push({
          blockId: block._id,
          engineerId: block.assignedEngineerId,
          assignedAt: new Date(Date.now() - Math.random() * 1e10),
        });
      }
    }

    if (assignments.length > 0) {
      await Assignment.insertMany(assignments);
      console.log(`✓ Created ${assignments.length} assignments`);
    }

    console.log('\n✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
