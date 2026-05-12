import mongoose from "mongoose";

const blockSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    description: String,
    techNode: String,
    complexity: {
      type: String,
      enum: ["Simple", "Medium", "Complex", "Critical"],
      required: true,
    },
    baseHours: {
      type: Number,
      required: true,
    },
    actualHours: {
      type: Number,
      default: 0,
    },
    estimatedHours: Number,
    estimatedArea: Number,
    areaUnit: String,
    status: {
      type: String,
      enum: ["Not Started", "In Progress", "DRC", "LVS", "Review", "Completed"],
      default: "Not Started",
    },
    assignedEngineerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    dependsOn: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Block",
      },
    ],
    criticPath: {
      type: Boolean,
      default: false,
    },
    notes: String,
    overrideReason: String,
    overrideUpdatedAt: Date,
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

// Middleware to set completedAt when status changes to Completed
blockSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'Completed' && !this.completedAt) {
      this.completedAt = new Date();
    }
    // Add to status history
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date()
    });
  }
  next();
});

// Also handle findOneAndUpdate
blockSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update.status === 'Completed' || update.$set?.status === 'Completed') {
    if (!update.completedAt && !update.$set?.completedAt) {
      if (update.$set) {
        update.$set.completedAt = new Date();
      } else {
        update.completedAt = new Date();
      }
    }
  }
  next();
});

export default mongoose.model("Block", blockSchema);
