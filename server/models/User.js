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
      enum: ['ENGINEER', 'MANAGER', 'ADMIN'],
      default: 'ENGINEER',
    },
    active: {
      type: Boolean,
      default: true,
    },
    skills: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
