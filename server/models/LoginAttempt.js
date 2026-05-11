import mongoose from 'mongoose';

const loginAttemptSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['ALLOWED', 'BLOCKED'],
      required: true,
    },
    reason: {
      type: String,
      default: null,
    },
    ip: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model('LoginAttempt', loginAttemptSchema);
