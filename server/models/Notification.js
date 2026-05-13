import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'PENDING_USER',
        'BLOCK_ASSIGNED',
        'BLOCK_APPROVED',
        'BLOCK_REJECTED',
        'STAGE_ADVANCEMENT_REQUEST',
        'STAGE_ADVANCEMENT_APPROVED',
        'STAGE_ADVANCEMENT_REJECTED'
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedBlockId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Block',
      default: null,
    },
    relatedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
