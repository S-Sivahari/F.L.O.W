import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    googleId: String,
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    avatar: String,
    role: {
      type: String,
      enum: ['ENGINEER', 'MANAGER', 'ADMIN', 'PENDING'],
      default: 'PENDING',
    },
    active: {
      type: Boolean,
      default: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    firstLoginAt: {
      type: Date,
      default: null,
    },
    roleAssignedAt: {
      type: Date,
      default: null,
    },
    roleAssignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
