import express from 'express';
import Assignment from '../models/Assignment.js';
import Block from '../models/Block.js';
import User from '../models/User.js';
import { notifyBlockAssigned } from '../services/notificationService.js';

const router = express.Router();
const MAX_BLOCKS_PER_ENGINEER = 5;

// Get all assignments
router.get('/', async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate('blockId')
      .populate('engineerId');

    const validAssignments = assignments.filter((assignment) => assignment.blockId);
    const danglingIds = assignments
      .filter((assignment) => !assignment.blockId)
      .map((assignment) => assignment._id);

    // Clean up stale assignment records pointing to deleted blocks
    if (danglingIds.length > 0) {
      await Assignment.deleteMany({ _id: { $in: danglingIds } });
    }

    res.json(validAssignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk reassign: move all assignments from one engineer to another (admin workflow)
router.post('/bulk-reassign', async (req, res) => {
  try {
    const { fromEngineerId, toEngineerId } = req.body;
    if (!fromEngineerId || !toEngineerId) {
      return res.status(400).json({ error: 'fromEngineerId and toEngineerId are required' });
    }
    if (String(fromEngineerId) === String(toEngineerId)) {
      return res.status(400).json({ error: 'Source and target engineers must differ' });
    }

    const assignments = await Assignment.find({ engineerId: fromEngineerId });
    if (assignments.length === 0) {
      return res.json({ moved: 0, message: 'No assignments for this engineer' });
    }

    const targetUser = await User.findById(toEngineerId);
    if (!targetUser) {
      return res.status(404).json({ error: 'Target engineer not found' });
    }

    let moved = 0;
    for (const a of assignments) {
      await Assignment.deleteMany({ blockId: a.blockId });
      const newAssignment = new Assignment({
        blockId: a.blockId,
        engineerId: toEngineerId,
        assignedAt: new Date(),
      });
      await newAssignment.save();
      await Block.findByIdAndUpdate(a.blockId, { assignedEngineerId: toEngineerId });
      moved += 1;
    }

    res.json({ moved, message: `Reassigned ${moved} block(s)` });
  } catch (error) {
    console.error('Bulk reassign error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Assign engineer to block
router.post('/', async (req, res) => {
  try {
    console.log('📥 POST /assignments request body:', req.body);
    const { blockId, engineerId } = req.body;

    if (!blockId || !engineerId) {
      console.log('❌ Missing required fields. blockId:', blockId, 'engineerId:', engineerId);
      return res.status(400).json({ error: 'blockId and engineerId are required' });
    }

    // Check capacity
    const count = await Assignment.countDocuments({ engineerId });
    console.log(`ℹ️ Engineer ${engineerId} has ${count} assignments`);
    
    if (count >= MAX_BLOCKS_PER_ENGINEER) {
      return res.status(400).json({ error: 'Engineer at full capacity' });
    }

    // Remove prior assignment for this block
    await Assignment.deleteOne({ blockId });

    const assignment = new Assignment({ blockId, engineerId });
    await assignment.save();

    // Fetch and populate in a single query
    const populated = await Assignment.findById(assignment._id)
      .populate('blockId')
      .populate('engineerId');

    // Update block
    await Block.findByIdAndUpdate(blockId, { assignedEngineerId: engineerId });

    // Notify the engineer about the assignment
    const engineer = await User.findById(engineerId);
    const block = await Block.findById(blockId);
    if (engineer && block) {
      await notifyBlockAssigned(block, engineer, req.user);
    }

    console.log('✅ Assignment created:', assignment._id);
    res.status(201).json(populated);
  } catch (error) {
    console.error('❌ Assignment error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Unassign engineer from block
router.delete('/:blockId', async (req, res) => {
  try {
    await Assignment.deleteOne({ blockId: req.params.blockId });
    await Block.findByIdAndUpdate(req.params.blockId, { assignedEngineerId: null });
    res.json({ message: 'Unassigned successfully' });
  } catch (error) {
    console.error('Unassign error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all engineers (MUST come before /load/:engineerId to prevent parameter matching)
router.get('/engineers/list', async (req, res) => {
  try {
    console.log('📥 GET /assignments/engineers/list request');
    const engineers = await User.find({ role: 'ENGINEER' });
    console.log(`✅ Found ${engineers.length} engineers`);
    res.json(engineers);
  } catch (error) {
    console.error('❌ Error fetching engineers:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get engineer load
router.get('/load/:engineerId', async (req, res) => {
  try {
    const count = await Assignment.countDocuments({ engineerId: req.params.engineerId });
    res.json({ engineerId: req.params.engineerId, load: count, capacity: MAX_BLOCKS_PER_ENGINEER });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
