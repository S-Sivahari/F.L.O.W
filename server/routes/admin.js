import express from 'express';
import { ensureAuthenticated, ensureRole } from '../middleware/auth.js';
import { triggerManualCleanup } from '../services/cleanupService.js';
import LoginAttempt from '../models/LoginAttempt.js';
import Block from '../models/Block.js';

const router = express.Router();

// Get all login attempts (admin only)
router.get('/login-attempts', ensureAuthenticated, ensureRole(['ADMIN']), async (req, res) => {
  try {
    const attempts = await LoginAttempt.find()
      .sort({ createdAt: -1 })
      .limit(200);
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Force block stage change (admin only)
router.post('/force-block-stage', ensureAuthenticated, ensureRole(['ADMIN']), async (req, res) => {
  try {
    const { blockId, status, note } = req.body;
    
    if (!blockId || !status) {
      return res.status(400).json({ error: 'blockId and status are required' });
    }

    const block = await Block.findByIdAndUpdate(
      blockId,
      { 
        status,
        overrideReason: note || 'Admin override',
        overrideUpdatedAt: new Date()
      },
      { new: true }
    );

    if (!block) {
      return res.status(404).json({ error: 'Block not found' });
    }

    res.json(block);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manually trigger cleanup of completed blocks (admin only)
router.post('/cleanup-completed-blocks', ensureAuthenticated, ensureRole(['ADMIN']), async (req, res) => {
  try {
    const result = await triggerManualCleanup();
    res.json({
      message: `Cleanup completed. Deleted ${result.deleted} blocks.`,
      ...result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
