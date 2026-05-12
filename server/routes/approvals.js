import express from 'express';
import Approval from '../models/Approval.js';

const router = express.Router();

// Get all approvals (filtered by role)
router.get('/', async (req, res) => {
  try {
    let query = {};
    
    // Engineers can only see their own approval requests
    if (req.user?.role === 'ENGINEER') {
      query.engineerId = req.user._id;
    }
    
    const approvals = await Approval.find(query)
      .populate('blockId')
      .populate('requestedBy')
      .populate('approvedBy');
    res.json(approvals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pending approvals
router.get('/pending', async (req, res) => {
  try {
    const approvals = await Approval.find({ status: 'Pending' })
      .populate('blockId')
      .populate('requestedBy');
    res.json(approvals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create approval request
router.post('/', async (req, res) => {
  try {
    const approval = new Approval({
      ...req.body,
      status: 'Pending',
    });
    await approval.save();
    await approval.populate('blockId').populate('requestedBy');
    res.status(201).json(approval);
  } catch (error) {
    console.error('Approval creation error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Approve
router.put('/:id/approve', async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ error: 'Approval ID is required' });
    }

    const approval = await Approval.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Approved',
        processedAt: new Date(),
      },
      { new: true }
    ).populate('blockId').populate('requestedBy').populate('approvedBy');

    if (!approval) return res.status(404).json({ error: 'Approval not found' });
    res.json(approval);
  } catch (error) {
    console.error('Approval error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Reject
router.put('/:id/reject', async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ error: 'Approval ID is required' });
    }

    const approval = await Approval.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Rejected',
        rejectionReason: req.body.rejectionReason,
        processedAt: new Date(),
      },
      { new: true }
    ).populate('blockId').populate('requestedBy').populate('approvedBy');

    if (!approval) return res.status(404).json({ error: 'Approval not found' });
    res.json(approval);
  } catch (error) {
    console.error('Rejection error:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
