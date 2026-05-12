import express from 'express';
import Block from '../models/Block.js';
import Assignment from '../models/Assignment.js';
import WorkflowLog from '../models/WorkflowLog.js';
import { ensureRole } from '../middleware/auth.js';

const PIPELINE_STAGES = [
  'Not Started',
  'In Progress',
  'DRC',
  'LVS',
  'Review',
  'Completed',
];

const router = express.Router();
const COMPLEXITY_FACTORS = {
  Simple: 1,
  Medium: 1.5,
  Complex: 2.5,
  Critical: 4,
};

function normalizeId(value) {
  return String(value?._id || value?.id || value || '');
}

function wouldCreateCycle(blockId, dependsOn = [], allBlocks = []) {
  const sourceId = normalizeId(blockId);
  if (!sourceId) return false;

  const graph = {};
  allBlocks.forEach((block) => {
    const id = normalizeId(block);
    if (!id) return;
    graph[id] = (block.dependsOn || []).map(normalizeId).filter(Boolean);
  });

  graph[sourceId] = (dependsOn || []).map(normalizeId).filter(Boolean);

  const visiting = new Set();
  const visited = new Set();

  function hasCycle(nodeId) {
    if (visiting.has(nodeId)) return true;
    if (visited.has(nodeId)) return false;

    visiting.add(nodeId);
    for (const neighborId of graph[nodeId] || []) {
      if (hasCycle(neighborId)) return true;
    }
    visiting.delete(nodeId);
    visited.add(nodeId);
    return false;
  }

  return hasCycle(sourceId);
}

// Get all blocks (filtered by role)
router.get('/', async (req, res) => {
  try {
    console.log('📥 GET /api/blocks request received');
    console.log('👤 User:', req.user?.email, 'Role:', req.user?.role);
    
    let query = {};
    
    // Engineers can only see their assigned blocks
    if (req.user?.role === 'ENGINEER') {
      query.assignedEngineerId = req.user._id;
      console.log('🔒 Engineer filter applied - only showing assigned blocks');
    }
    
    const blocks = await Block.find(query).populate('assignedEngineerId').populate('dependsOn');
    console.log(`✅ Found ${blocks.length} blocks`);
    res.json(blocks);
  } catch (error) {
    console.error('❌ Error fetching blocks:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create block
router.post('/', ensureRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const { name, type, complexity, baseHours, ...rest } = req.body;
    
    // Validate required fields
    if (!name || !type || !complexity || baseHours === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, type, complexity, baseHours' 
      });
    }

    const numericBaseHours = Number(baseHours);
    if (!Number.isFinite(numericBaseHours) || numericBaseHours <= 0) {
      return res.status(400).json({ error: 'baseHours must be a positive number' });
    }
    const dependsOn = Array.from(new Set((rest.dependsOn || []).map(normalizeId).filter(Boolean)));
    if (dependsOn.length > 0) {
      const dependencyCount = await Block.countDocuments({ _id: { $in: dependsOn } });
      if (dependencyCount !== dependsOn.length) {
        return res.status(400).json({ error: 'One or more dependencies do not exist' });
      }
    }
    const factor = COMPLEXITY_FACTORS[complexity] ?? 1;
    const estimatedHours = Math.round(numericBaseHours * factor);

    const block = new Block({
      name,
      type,
      complexity,
      baseHours: numericBaseHours,
      estimatedHours,
      status: 'Not Started',
      actualHours: 0,
      ...rest,
      dependsOn,
    });

    await block.save();
    await block.populate('assignedEngineerId');
    await block.populate('dependsOn');
    
    res.status(201).json(block);
  } catch (error) {
    console.error('Block creation error:', error);
    res.status(400).json({ error: error.message || 'Failed to create block' });
  }
});

// Get single block
router.get('/:id', async (req, res) => {
  try {
    const block = await Block.findById(req.params.id).populate('assignedEngineerId').populate('dependsOn');
    if (!block) return res.status(404).json({ error: 'Block not found' });
    res.json(block);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: force block to any pipeline stage (audited)
router.put('/:id/force-stage', async (req, res) => {
  try {
    const { status, performedBy, note } = req.body;
    if (!PIPELINE_STAGES.includes(status)) {
      return res.status(400).json({ error: 'Invalid status for pipeline' });
    }
    if (!performedBy) {
      return res.status(400).json({ error: 'performedBy (user id) is required for audit' });
    }

    const existing = await Block.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Block not found' });
    const previousStatus = existing.status;

    const block = await Block.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate('assignedEngineerId')
      .populate('dependsOn');

    await WorkflowLog.create({
      blockId: block._id,
      action: `Force stage: ${status}`,
      performedBy,
      details: { note: note || null, previousStatus },
      timestamp: new Date(),
    });

    res.json(block);
  } catch (error) {
    console.error('Force stage error:', error);
    res.status(400).json({ error: error.message || 'Failed to force stage' });
  }
});

// Update block
router.put('/:id', async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ error: 'Block ID is required' });
    }

    if (req.body.dependsOn) {
      const dependencyIds = req.body.dependsOn.map(normalizeId).filter(Boolean);
      if (dependencyIds.includes(String(req.params.id))) {
        return res.status(400).json({ error: 'A block cannot depend on itself' });
      }

      const allBlocks = await Block.find();
      const hasCycle = wouldCreateCycle(req.params.id, dependencyIds, allBlocks);
      if (hasCycle) {
        return res.status(400).json({ error: 'Circular dependencies are not allowed' });
      }
    }

    const existingBlock = await Block.findById(req.params.id);
    if (!existingBlock) return res.status(404).json({ error: 'Block not found' });

    const nextStatus = req.body.status ?? existingBlock.status;
    const statusChanged = nextStatus !== existingBlock.status;
    if (statusChanged && nextStatus !== 'Not Started') {
      const dependencyIds = (existingBlock.dependsOn || []).map(normalizeId).filter(Boolean);
      if (dependencyIds.length > 0) {
        const incompleteDependencies = await Block.find({
          _id: { $in: dependencyIds },
          status: { $ne: 'Completed' },
        }).select('name status');

        if (incompleteDependencies.length > 0) {
          const names = incompleteDependencies.map((dep) => dep.name).join(', ');
          return res.status(400).json({
            error: `Cannot progress block until dependencies are completed: ${names}`,
          });
        }
      }
    }

    // Handle timestamp tracking for automatic hours calculation
    const updateData = { ...req.body };
    if (statusChanged) {
      // Track status history
      if (!existingBlock.statusHistory) {
        existingBlock.statusHistory = [];
      }
      existingBlock.statusHistory.push({
        status: nextStatus,
        timestamp: new Date(),
      });
      updateData.statusHistory = existingBlock.statusHistory;

      // Set startedAt when moving to In Progress
      if (nextStatus === 'In Progress' && !existingBlock.startedAt) {
        updateData.startedAt = new Date();
      }

      // Set completedAt and calculate actual hours when moving to Completed
      if (nextStatus === 'Completed' && !existingBlock.completedAt) {
        updateData.completedAt = new Date();
        
        // Auto-calculate actualHours based on time spent
        if (updateData.startedAt || existingBlock.startedAt) {
          const start = updateData.startedAt || existingBlock.startedAt;
          const end = updateData.completedAt;
          const hoursSpent = Math.ceil((end - start) / (1000 * 60 * 60)); // Convert ms to hours, rounded up
          updateData.actualHours = Math.max(hoursSpent, 1); // At least 1 hour
        }
      }
    }

    const block = await Block.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('assignedEngineerId')
      .populate('dependsOn');

    res.json(block);
  } catch (error) {
    console.error('Block update error:', error);
    res.status(400).json({ error: error.message || 'Failed to update block' });
  }
});

// Override estimated effort for a block with required justification
router.put('/:id/override-effort', async (req, res) => {
  try {
    const { estimatedHours, overrideReason } = req.body;

    if (!req.params.id) {
      return res.status(400).json({ error: 'Block ID is required' });
    }
    if (typeof estimatedHours !== 'number' || estimatedHours <= 0) {
      return res.status(400).json({ error: 'estimatedHours must be a positive number' });
    }
    const adminOverride = req.body.adminOverride === true;
    const reason = overrideReason != null ? String(overrideReason).trim() : '';
    if (!adminOverride && !reason) {
      return res.status(400).json({ error: 'overrideReason is required' });
    }

    const block = await Block.findByIdAndUpdate(
      req.params.id,
      {
        estimatedHours,
        overrideReason: reason || (adminOverride ? 'Admin override (no justification required)' : ''),
        overrideUpdatedAt: new Date(),
      },
      { new: true }
    )
      .populate('assignedEngineerId')
      .populate('dependsOn');

    if (!block) return res.status(404).json({ error: 'Block not found' });
    res.json(block);
  } catch (error) {
    console.error('Override effort error:', error);
    res.status(400).json({ error: error.message || 'Failed to override effort' });
  }
});

// Delete block
router.delete('/:id', async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ error: 'Block ID is required' });
    }

    const block = await Block.findByIdAndDelete(req.params.id);
    if (!block) return res.status(404).json({ error: 'Block not found' });

    // Remove assignments tied to this block
    await Assignment.deleteMany({ blockId: block._id });

    // Remove deleted block from dependency lists on remaining blocks
    await Block.updateMany(
      { dependsOn: block._id },
      { $pull: { dependsOn: block._id } }
    );

    res.json({ message: 'Block deleted successfully' });
  } catch (error) {
    console.error('Block delete error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete block' });
  }
});

export default router;
