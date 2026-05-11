import express from 'express';
import WorkflowLog from '../models/WorkflowLog.js';

const router = express.Router();

// Get all workflow logs
router.get('/', async (req, res) => {
  try {
    const logs = await WorkflowLog.find()
      .populate('blockId')
      .populate('performedBy')
      .sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get logs for specific block
router.get('/block/:blockId', async (req, res) => {
  try {
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
    await log.populate('blockId').populate('performedBy');
    res.status(201).json(log);
  } catch (error) {
    console.error('Workflow log error:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
