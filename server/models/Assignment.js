import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
  {
    blockId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Block',
      required: true,
    },
    engineerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model('Assignment', assignmentSchema);
