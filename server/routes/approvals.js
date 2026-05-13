import express from 'express';
import Approval from '../models/Approval.js';
import Block from '../models/Block.js';
import User from '../models/User.js';
import { ensureRole } from '../middleware/auth.js';
import { 
  notifyStageAdvancementRequest,
  notifyStageAdvancementApproved,
  notifyStageAdvancementRejected
} from '../services/notificationService.js';

const router = express.Router();

// Get all approvals (filtered by role)
router.get('/', async (req, res) => {
  try {
    let query = {};
    
    // Engineers can only see their own approval requests
    if (req.user?.role === 'ENGINEER') {
      query.requestedBy = req.user._id;
    }
    
    const approvals = await Approval.find(query)
      .populate(['blockId', 'requestedBy', 'approvedBy']);
    res.json(approvals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pending approvals
router.get('/pending', async (req, res) => {
  try {
    const approvals = await Approval.find({ status: 'Pending' })
      .populate(['blockId', 'requestedBy']);
    res.json(approvals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create approval request (for stage advancement)
router.post('/', async (req, res) => {
  try {
    const { blockId, requestedBy, currentStage, requestedStage } = req.body;
    
    if (!blockId || !requestedBy || !currentStage || !requestedStage) {
      return res.status(400).json({ 
        error: 'blockId, requestedBy, currentStage, and requestedStage are required' 
      });
    }

    const block = await Block.findById(blockId);
    if (!block) {
      return res.status(404).json({ error: 'Block not found' });
    }

    const engineer = await User.findById(requestedBy);
    if (!engineer) {
      return res.status(404).json({ error: 'Engineer not found' });
    }

    const approval = new Approval({
      blockId,
      requestedBy,
      currentStage,
      requestedStage,
      status: 'Pending',
    });
    await approval.save();
    
    // Refetch with populated fields
    const populatedApproval = await Approval.findById(approval._id)
      .populate(['blockId', 'requestedBy']);

    // Notify managers about the stage advancement request
    await notifyStageAdvancementRequest(block, engineer, currentStage, requestedStage);

    res.status(201).json(populatedApproval);
  } catch (error) {
    console.error('Approval creation error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Approve stage advancement
router.put('/:id/approve', ensureRole(['MANAGER']), async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ error: 'Approval ID is required' });
    }

    const approval = await Approval.findById(req.params.id)
      .populate(['blockId', 'requestedBy']);

    if (!approval) {
      return res.status(404).json({ error: 'Approval not found' });
    }

    // Update approval status
    approval.status = 'Approved';
    approval.approvedBy = req.body.approvedBy || req.user._id;
    approval.processedAt = new Date();
    await approval.save();

    // Update block to the requested stage
    const block = await Block.findByIdAndUpdate(
      approval.blockId._id,
      { status: approval.requestedStage },
      { new: true }
    );

    // Notify engineer about approval
    const manager = await User.findById(approval.approvedBy);
    await notifyStageAdvancementApproved(
      block,
      approval.requestedBy,
      manager,
      approval.currentStage,
      approval.requestedStage
    );

    // Refetch with all populated fields
    const populatedApproval = await Approval.findById(approval._id)
      .populate(['blockId', 'requestedBy', 'approvedBy']);
    
    res.json(populatedApproval);
  } catch (error) {
    console.error('Approval error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Reject stage advancement
router.put('/:id/reject', ensureRole(['MANAGER']), async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ error: 'Approval ID is required' });
    }

    const approval = await Approval.findById(req.params.id)
      .populate(['blockId', 'requestedBy']);

    if (!approval) {
      return res.status(404).json({ error: 'Approval not found' });
    }

    // Update approval status
    approval.status = 'Rejected';
    approval.approvedBy = req.body.approvedBy || req.user._id;
    approval.rejectionReason = req.body.rejectionReason;
    approval.processedAt = new Date();
    await approval.save();

    // Block stays at current stage (no change needed)

    // Notify engineer about rejection
    const manager = await User.findById(approval.approvedBy);
    await notifyStageAdvancementRejected(
      approval.blockId,
      approval.requestedBy,
      manager,
      approval.currentStage,
      approval.requestedStage,
      approval.rejectionReason
    );

    // Refetch with all populated fields
    const populatedApproval = await Approval.findById(approval._id)
      .populate(['blockId', 'requestedBy', 'approvedBy']);
    
    res.json(populatedApproval);
  } catch (error) {
    console.error('Rejection error:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
