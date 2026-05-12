import Notification from '../models/Notification.js';
import User from '../models/User.js';

/**
 * Create notification for pending user (notify all admins)
 */
export async function notifyPendingUser(newUser) {
  try {
    const admins = await User.find({ role: 'ADMIN', active: true });
    
    const notifications = admins.map((admin) => ({
      userId: admin._id,
      type: 'PENDING_USER',
      title: 'New User Awaiting Role Assignment',
      message: `${newUser.name} (${newUser.email}) has logged in and is awaiting role assignment.`,
      relatedUserId: newUser._id,
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (error) {
    console.error('Error creating pending user notification:', error);
  }
}

/**
 * Create notification for block assignment (notify the assigned engineer)
 */
export async function notifyBlockAssigned(block, engineer, assignedBy) {
  try {
    await Notification.create({
      userId: engineer._id,
      type: 'BLOCK_ASSIGNED',
      title: 'New Block Assigned',
      message: `You have been assigned to work on "${block.name}" by ${assignedBy?.name || 'Manager'}.`,
      relatedBlockId: block._id,
    });
  } catch (error) {
    console.error('Error creating block assignment notification:', error);
  }
}

/**
 * Create notification for block approval (notify the engineer)
 */
export async function notifyBlockApproved(block, engineer, approvedBy) {
  try {
    if (!engineer) return;
    
    await Notification.create({
      userId: engineer._id,
      type: 'BLOCK_APPROVED',
      title: 'Block Approved',
      message: `Your block "${block.name}" has been approved by ${approvedBy?.name || 'Manager'}.`,
      relatedBlockId: block._id,
    });
  } catch (error) {
    console.error('Error creating block approval notification:', error);
  }
}

/**
 * Create notification for block rejection (notify the engineer)
 */
export async function notifyBlockRejected(block, engineer, rejectedBy, reason) {
  try {
    if (!engineer) return;
    
    await Notification.create({
      userId: engineer._id,
      type: 'BLOCK_REJECTED',
      title: 'Block Rejected',
      message: `Your block "${block.name}" has been rejected by ${rejectedBy?.name || 'Manager'}. Reason: ${reason || 'No reason provided'}`,
      relatedBlockId: block._id,
    });
  } catch (error) {
    console.error('Error creating block rejection notification:', error);
  }
}
