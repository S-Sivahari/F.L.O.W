import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Block from '../models/Block.js';
import Assignment from '../models/Assignment.js';
import Approval from '../models/Approval.js';
import WorkflowLog from '../models/WorkflowLog.js';
import Notification from '../models/Notification.js';
import LoginAttempt from '../models/LoginAttempt.js';
import { connectDB } from '../config/database.js';

// Load .env from parent directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
dotenv.config({ path: path.join(rootDir, '.env') });

const COMPLEXITY_FACTORS = {
  Simple: 1,
  Medium: 1.5,
  Complex: 2.5,
  Critical: 4,
};

function computeEstimatedHours(baseHours, complexity) {
  const factor = COMPLEXITY_FACTORS[complexity] || 1;
  return Math.round(baseHours * factor);
}

async function seedDatabase() {
  try {
    await connectDB();

    console.log('🗑️  Clearing existing data...');
    // Clear ALL existing data
    await Promise.all([
      User.deleteMany({}),
      Block.deleteMany({}),
      Assignment.deleteMany({}),
      Approval.deleteMany({}),
      WorkflowLog.deleteMany({}),
      Notification.deleteMany({}),
      LoginAttempt.deleteMany({}),
    ]);
    console.log('✅ Cleared all existing data\n');

    // Create users with realistic names and roles
    console.log('👥 Creating users...');
    const users = await User.insertMany([
      // Admin
      {
        name: 'Alex Rivera',
        email: 'alex.rivera@flow.io',
        role: 'ADMIN',
        active: true,
        skills: ['System Administration', 'Project Management'],
        firstLoginAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        roleAssignedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      // Managers
      {
        name: 'Sarah Chen',
        email: 'sarah.chen@flow.io',
        role: 'MANAGER',
        active: true,
        skills: ['Analog Design', 'Team Leadership', 'Layout Review'],
        firstLoginAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        roleAssignedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'Michael Thompson',
        email: 'michael.thompson@flow.io',
        role: 'MANAGER',
        active: true,
        skills: ['Mixed-Signal Design', 'DRC/LVS', 'Mentoring'],
        firstLoginAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        roleAssignedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      },
      // Engineers
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@flow.io',
        role: 'ENGINEER',
        active: true,
        skills: ['Analog Layout', 'Current Mirrors', 'Bandgap References'],
        firstLoginAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        roleAssignedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'David Kim',
        email: 'david.kim@flow.io',
        role: 'ENGINEER',
        active: true,
        skills: ['Digital Layout', 'OTA Design', 'High-Speed Circuits'],
        firstLoginAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        roleAssignedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@flow.io',
        role: 'ENGINEER',
        active: true,
        skills: ['Differential Pairs', 'Comparators', 'Low-Power Design'],
        firstLoginAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        roleAssignedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'James Wilson',
        email: 'james.wilson@flow.io',
        role: 'ENGINEER',
        active: true,
        skills: ['Inverter Chains', 'Clock Distribution', 'Buffer Design'],
        firstLoginAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        roleAssignedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'Lisa Anderson',
        email: 'lisa.anderson@flow.io',
        role: 'ENGINEER',
        active: true,
        skills: ['Voltage References', 'Precision Circuits', 'Trimming'],
        firstLoginAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        roleAssignedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      },
    ]);

    const [admin, manager1, manager2, eng1, eng2, eng3, eng4, eng5] = users;
    console.log(`✅ Created ${users.length} users (1 Admin, 2 Managers, 5 Engineers)\n`);

    // Create blocks with realistic analog IC layout blocks
    console.log('🧱 Creating blocks...');
    const blocksData = [
      // Not Started (3 blocks - unassigned, ready for assignment)
      {
        name: 'BIAS_GENERATOR_CORE',
        type: 'Current Mirror',
        description: 'Core bias generator circuit for the ADC. Provides stable current references across PVT variations.',
        techNode: '65nm',
        complexity: 'Medium',
        baseHours: 24,
        actualHours: 0,
        estimatedArea: 1500,
        areaUnit: 'µm²',
        status: 'Not Started',
        assignedEngineerId: null,
        criticPath: true,
      },
      {
        name: 'CLOCK_BUFFER_CHAIN',
        type: 'Inverter',
        description: 'High-drive clock buffer chain for distributing clock signals with minimal skew.',
        techNode: '28nm',
        complexity: 'Simple',
        baseHours: 10,
        actualHours: 0,
        estimatedArea: 400,
        areaUnit: 'µm²',
        status: 'Not Started',
        assignedEngineerId: null,
        criticPath: false,
      },
      {
        name: 'VOLTAGE_REFERENCE_TRIM',
        type: 'Bandgap Reference',
        description: 'Trimming circuit for voltage reference to achieve ±1% accuracy.',
        techNode: '90nm',
        complexity: 'Complex',
        baseHours: 35,
        actualHours: 0,
        estimatedArea: 2200,
        areaUnit: 'µm²',
        status: 'Not Started',
        assignedEngineerId: null,
        criticPath: true,
      },

      // In Progress (4 blocks - actively being worked on)
      {
        name: 'DIFFERENTIAL_PAIR_LV',
        type: 'Differential Pair',
        description: 'Low-voltage differential pair for input stage of operational amplifier.',
        techNode: '45nm',
        complexity: 'Medium',
        baseHours: 22,
        actualHours: 16,
        estimatedArea: 900,
        areaUnit: 'µm²',
        status: 'In Progress',
        assignedEngineerId: eng1._id,
        criticPath: true,
        startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'BANDGAP_REFERENCE_CORE',
        type: 'Bandgap Reference',
        description: 'Precision bandgap voltage reference with temperature compensation.',
        techNode: '180nm',
        complexity: 'Critical',
        baseHours: 90,
        actualHours: 65,
        estimatedArea: 5000,
        areaUnit: 'µm²',
        status: 'In Progress',
        assignedEngineerId: eng2._id,
        criticPath: true,
        startedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'OTA_HIGH_SWING',
        type: 'Operational Transconductance Amplifier (OTA)',
        description: 'High output swing OTA for switched-capacitor circuits.',
        techNode: '65nm',
        complexity: 'Complex',
        baseHours: 45,
        actualHours: 28,
        estimatedArea: 3200,
        areaUnit: 'µm²',
        status: 'In Progress',
        assignedEngineerId: eng3._id,
        criticPath: false,
        startedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'COMPARATOR_FAST',
        type: 'Comparator',
        description: 'High-speed comparator for flash ADC with sub-nanosecond delay.',
        techNode: '28nm',
        complexity: 'Complex',
        baseHours: 40,
        actualHours: 22,
        estimatedArea: 1800,
        areaUnit: 'µm²',
        status: 'In Progress',
        assignedEngineerId: eng4._id,
        criticPath: true,
        startedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },

      // DRC (2 blocks - design rule checking)
      {
        name: 'CURRENT_MIRROR_CASCODE',
        type: 'Current Mirror',
        description: 'Cascoded current mirror for improved output impedance.',
        techNode: '90nm',
        complexity: 'Medium',
        baseHours: 20,
        actualHours: 32,
        estimatedArea: 1100,
        areaUnit: 'µm²',
        status: 'DRC',
        assignedEngineerId: eng5._id,
        criticPath: true,
        startedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'RING_OSCILLATOR_STAGE',
        type: 'Inverter',
        description: 'Single stage of ring oscillator for on-chip clock generation.',
        techNode: '28nm',
        complexity: 'Simple',
        baseHours: 8,
        actualHours: 11,
        estimatedArea: 300,
        areaUnit: 'µm²',
        status: 'DRC',
        assignedEngineerId: eng1._id,
        criticPath: false,
        startedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      },

      // LVS (2 blocks - layout vs schematic verification)
      {
        name: 'OTA_LOW_POWER',
        type: 'Operational Transconductance Amplifier (OTA)',
        description: 'Ultra-low power OTA for biomedical applications.',
        techNode: '65nm',
        complexity: 'Complex',
        baseHours: 42,
        actualHours: 98,
        estimatedArea: 2600,
        areaUnit: 'µm²',
        status: 'LVS',
        assignedEngineerId: eng2._id,
        criticPath: true,
        startedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'DIFFERENTIAL_PAIR_HV',
        type: 'Differential Pair',
        description: 'High-voltage tolerant differential pair for automotive applications.',
        techNode: '180nm',
        complexity: 'Complex',
        baseHours: 38,
        actualHours: 92,
        estimatedArea: 1700,
        areaUnit: 'µm²',
        status: 'LVS',
        assignedEngineerId: eng3._id,
        criticPath: false,
        startedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      },

      // Review (2 blocks - waiting for manager approval)
      {
        name: 'BANDGAP_STARTUP_CIRCUIT',
        type: 'Bandgap Reference',
        description: 'Startup circuit to ensure bandgap reference powers up correctly.',
        techNode: '90nm',
        complexity: 'Critical',
        baseHours: 85,
        actualHours: 320,
        estimatedArea: 5500,
        areaUnit: 'µm²',
        status: 'Review',
        assignedEngineerId: eng4._id,
        criticPath: true,
        startedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'CURRENT_MIRROR_PRECISION',
        type: 'Current Mirror',
        description: 'Precision matched current mirror with 0.1% matching.',
        techNode: '45nm',
        complexity: 'Complex',
        baseHours: 44,
        actualHours: 108,
        estimatedArea: 1250,
        areaUnit: 'µm²',
        status: 'Review',
        assignedEngineerId: eng5._id,
        criticPath: false,
        startedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
      },

      // Completed (2 blocks - successfully completed)
      {
        name: 'LEVEL_SHIFTER_INV',
        type: 'Inverter',
        description: 'Level shifter inverter for interfacing between voltage domains.',
        techNode: '28nm',
        complexity: 'Simple',
        baseHours: 8,
        actualHours: 9,
        estimatedArea: 250,
        areaUnit: 'µm²',
        status: 'Completed',
        assignedEngineerId: eng1._id,
        criticPath: false,
        startedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'SIMPLE_CURRENT_SOURCE',
        type: 'Current Mirror',
        description: 'Basic current source for biasing circuits.',
        techNode: '65nm',
        complexity: 'Simple',
        baseHours: 10,
        actualHours: 12,
        estimatedArea: 600,
        areaUnit: 'µm²',
        status: 'Completed',
        assignedEngineerId: eng2._id,
        criticPath: false,
        startedAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      },
    ];

    // Add estimated hours to all blocks
    const blocksWithEstimates = blocksData.map((b) => ({
      ...b,
      estimatedHours: computeEstimatedHours(b.baseHours, b.complexity),
    }));

    const blocks = await Block.insertMany(blocksWithEstimates);
    console.log(`✅ Created ${blocks.length} blocks (3 Not Started, 4 In Progress, 2 DRC, 2 LVS, 2 Review, 2 Completed)\n`);

    // Create assignments for assigned blocks
    console.log('📋 Creating assignments...');
    const assignments = [];
    for (const block of blocks) {
      if (block.assignedEngineerId) {
        assignments.push({
          blockId: block._id,
          engineerId: block.assignedEngineerId,
          assignedAt: block.startedAt || new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000),
        });
      }
    }

    if (assignments.length > 0) {
      await Assignment.insertMany(assignments);
      console.log(`✅ Created ${assignments.length} assignments\n`);
    }

    // Create approval requests for blocks in Review status
    console.log('✅ Creating approval requests...');
    const reviewBlocks = blocks.filter(b => b.status === 'Review');
    const approvals = reviewBlocks.map(block => ({
      blockId: block._id,
      requestedBy: block.assignedEngineerId,
      status: 'Pending',
      requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    }));

    if (approvals.length > 0) {
      await Approval.insertMany(approvals);
      console.log(`✅ Created ${approvals.length} approval requests\n`);
    }

    // Create workflow logs for blocks that have progressed
    console.log('📝 Creating workflow logs...');
    const workflowLogs = [];
    
    for (const block of blocks) {
      if (block.status !== 'Not Started') {
        // Log "In Progress" transition
        workflowLogs.push({
          blockId: block._id,
          action: 'In Progress',
          performedBy: block.assignedEngineerId,
          timestamp: block.startedAt || new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        });

        // Log subsequent stages
        const stages = ['DRC', 'LVS', 'Review', 'Completed'];
        const currentStageIndex = stages.indexOf(block.status);
        
        if (currentStageIndex >= 0) {
          for (let i = 0; i <= currentStageIndex; i++) {
            workflowLogs.push({
              blockId: block._id,
              action: stages[i],
              performedBy: block.assignedEngineerId,
              timestamp: new Date((block.startedAt || new Date()).getTime() + (i + 1) * 2 * 24 * 60 * 60 * 1000),
            });
          }
        }
      }
    }

    if (workflowLogs.length > 0) {
      await WorkflowLog.insertMany(workflowLogs);
      console.log(`✅ Created ${workflowLogs.length} workflow log entries\n`);
    }

    console.log('✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${users.length} users (1 Admin, 2 Managers, 5 Engineers)`);
    console.log(`   - ${blocks.length} blocks across all stages`);
    console.log(`   - ${assignments.length} engineer assignments`);
    console.log(`   - ${approvals.length} pending approvals`);
    console.log(`   - ${workflowLogs.length} workflow transitions logged`);
    console.log('\n🎉 Ready to explore F.L.O.W!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
