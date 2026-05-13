import express from 'express';
import WorkflowLog from '../models/WorkflowLog.js';

const router = express.Router();

// Get all workflow logs (filtered by role)
router.get('/', async (req, res) => {
  try {
    let query = {};
    
    // Engineers can only see logs for their assigned blocks
    if (req.user?.role === 'ENGINEER') {
      const Block = (await import('../models/Block.js')).default;
      const engineerBlocks = await Block.find({ assignedEngineerId: req.user._id }).select('_id');
      const blockIds = engineerBlocks.map(b => b._id);
      query.blockId = { $in: blockIds };
    }
    
    const logs = await WorkflowLog.find(query)
      .populate('blockId')
      .populate('performedBy')
      .sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get logs for specific block (with permission check)
router.get('/block/:blockId', async (req, res) => {
  try {
    // Engineers can only see logs for their assigned blocks
    if (req.user?.role === 'ENGINEER') {
      const Block = (await import('../models/Block.js')).default;
      const block = await Block.findById(req.params.blockId);
      if (!block || String(block.assignedEngineerId) !== String(req.user._id)) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }
    
    const logs = await WorkflowLog.find({ blockId: req.params.blockId })
      .populate('performedBy')
      .sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create log entry
router.post('/', async (req, res) => {
  try {
    const { blockId, action } = req.body;
    
    if (!blockId || !action) {
      return res.status(400).json({ error: 'blockId and action are required' });
    }

    const log = new WorkflowLog({
      ...req.body,
      timestamp: new Date(),
    });
    await log.save();
    
    // Refetch with populated fields
    const populatedLog = await WorkflowLog.findById(log._id)
      .populate(['blockId', 'performedBy']);
    
    res.status(201).json(populatedLog);
  } catch (error) {
    console.error('Workflow log error:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
