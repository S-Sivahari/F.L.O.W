import express from 'express';
import Effort from '../models/Effort.js';
import Block from '../models/Block.js';

const router = express.Router();

// Get all effort logs
router.get('/', async (req, res) => {
  try {
    const efforts = await Effort.find().populate(['blockId', 'engineerId']);
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

    // Set block's actual hours directly to the value entered
    await Block.findByIdAndUpdate(blockId, { actualHours: hoursLogged });
    
    // Refetch with populated fields
    const populatedEffort = await Effort.findById(effort._id)
      .populate('blockId');
    
    res.status(201).json(populatedEffort);
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

    const blockIdRef = effort.blockId._id;
    
    // Set block's actual hours directly to the updated value
    await Block.findByIdAndUpdate(blockIdRef, { actualHours: effort.hoursLogged });

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

    // Set block's actual hours to 0 when effort is deleted
    await Block.findByIdAndUpdate(effort.blockId, { actualHours: 0 });

    res.json({ message: 'Effort deleted successfully' });
  } catch (error) {
    console.error('Effort delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
