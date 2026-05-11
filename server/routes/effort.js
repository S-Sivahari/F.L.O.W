import express from 'express';
import Effort from '../models/Effort.js';
import Block from '../models/Block.js';

const router = express.Router();

// Get all effort logs
router.get('/', async (req, res) => {
  try {
    const efforts = await Effort.find().populate('blockId').populate('engineerId');
    res.json(efforts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get effort by block
router.get('/block/:blockId', async (req, res) => {
  try {
    const efforts = await Effort.find({ blockId: req.params.blockId })
      .populate('engineerId');
    res.json(efforts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Log effort
router.post('/', async (req, res) => {
  try {
    const { blockId, hoursLogged } = req.body;
    
    if (!blockId || hoursLogged === undefined) {
      return res.status(400).json({ error: 'blockId and hoursLogged are required' });
    }

    const effort = new Effort(req.body);
    await effort.save();
    await effort.populate('blockId');

    // Update block's actual hours
    const totalEffort = await Effort.aggregate([
      { $match: { blockId: effort.blockId } },
      { $group: { _id: null, total: { $sum: '$hoursLogged' } } },
    ]);

    if (totalEffort.length > 0) {
      await Block.findByIdAndUpdate(effort.blockId, { actualHours: totalEffort[0].total });
    }

    res.status(201).json(effort);
  } catch (error) {
    console.error('Effort logging error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update effort
router.put('/:id', async (req, res) => {
  try {
    const oldEffort = await Effort.findById(req.params.id);
    const effort = await Effort.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('blockId');

    if (!effort) return res.status(404).json({ error: 'Effort not found' });

    // Update block's actual hours
    const totalEffort = await Effort.aggregate([
      { $match: { blockId: effort.blockId } },
      { $group: { _id: null, total: { $sum: '$hoursLogged' } } },
    ]);

    if (totalEffort.length > 0) {
      await Block.findByIdAndUpdate(effort.blockId, { actualHours: totalEffort[0].total });
    }

    res.json(effort);
  } catch (error) {
    console.error('Effort update error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete effort
router.delete('/:id', async (req, res) => {
  try {
    const effort = await Effort.findByIdAndDelete(req.params.id);
    if (!effort) return res.status(404).json({ error: 'Effort not found' });

    // Update block's actual hours
    const totalEffort = await Effort.aggregate([
      { $match: { blockId: effort.blockId } },
      { $group: { _id: null, total: { $sum: '$hoursLogged' } } },
    ]);

    if (totalEffort.length > 0) {
      await Block.findByIdAndUpdate(effort.blockId, { actualHours: totalEffort[0].total });
    } else {
      await Block.findByIdAndUpdate(effort.blockId, { actualHours: 0 });
    }

    res.json({ message: 'Effort deleted successfully' });
  } catch (error) {
    console.error('Effort delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
