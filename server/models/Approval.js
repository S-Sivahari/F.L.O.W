import mongoose from 'mongoose';

const approvalSchema = new mongoose.Schema(
  {
    blockId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Block',
      required: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    currentStage: {
      type: String,
      required: true,
    },
    requestedStage: {
      type: String,
      required: true,
    },
    reason: String,
    rejectionReason: String,
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    processedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model('Approval', approvalSchema);
