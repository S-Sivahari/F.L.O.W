import Block from '../models/Block.js';
import Assignment from '../models/Assignment.js';
import Approval from '../models/Approval.js';
import WorkflowLog from '../models/WorkflowLog.js';

const CLEANUP_INTERVAL = 60 * 60 * 1000; // Run every hour
const COMPLETION_RETENTION_HOURS = 48; // Delete after 48 hours

/**
 * Delete completed blocks that are older than 48 hours
 */
export async function cleanupCompletedBlocks() {
  try {
    const cutoffDate = new Date(Date.now() - COMPLETION_RETENTION_HOURS * 60 * 60 * 1000);
    
    // Find completed blocks older than 48 hours
    const blocksToDelete = await Block.find({
      status: 'Completed',
      completedAt: { $lt: cutoffDate, $ne: null }
    });

    if (blocksToDelete.length === 0) {
      console.log('✅ No completed blocks to clean up');
      return { deleted: 0 };
    }

    const blockIds = blocksToDelete.map(b => b._id);
    
    // Delete related data
    await Promise.all([
      Assignment.deleteMany({ blockId: { $in: blockIds } }),
      Approval.deleteMany({ blockId: { $in: blockIds } }),
      WorkflowLog.deleteMany({ blockId: { $in: blockIds } })
    ]);

    // Delete the blocks
    const result = await Block.deleteMany({ _id: { $in: blockIds } });

    console.log(`🗑️  Cleaned up ${result.deletedCount} completed blocks older than 48 hours`);
    return { deleted: result.deletedCount, blocks: blocksToDelete.map(b => b.name) };
  } catch (error) {
    console.error('❌ Error cleaning up completed blocks:', error);
    return { deleted: 0, error: error.message };
  }
}

/**
 * Start the cleanup scheduler
 */
export function startCleanupScheduler() {
  console.log('🕐 Starting cleanup scheduler (runs every hour)');
  
  // Run immediately on startup
  cleanupCompletedBlocks();
  
  // Then run every hour
  setInterval(cleanupCompletedBlocks, CLEANUP_INTERVAL);
}

/**
 * Manually trigger cleanup (for testing or admin actions)
 */
export async function triggerManualCleanup() {
  console.log('🔧 Manual cleanup triggered');
  return await cleanupCompletedBlocks();
}
