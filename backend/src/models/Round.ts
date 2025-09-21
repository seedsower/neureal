import mongoose, { Document, Schema } from 'mongoose';

export interface IRound extends Document {
  roundId: number;
  startTime: Date;
  lockTime: Date;
  endTime: Date;
  startPrice: string;
  lockPrice?: string;
  endPrice?: string;
  totalUpAmount: string;
  totalDownAmount: string;
  rewardAmount: string;
  state: 'ACTIVE' | 'LOCKED' | 'RESOLVED' | 'CANCELLED';
  resolved: boolean;
  winningPosition?: 'UP' | 'DOWN';
  
  // Additional metadata
  participantCount: number;
  upParticipants: number;
  downParticipants: number;
  
  // Price history for the round
  priceHistory: Array<{
    timestamp: Date;
    price: string;
    source: string;
  }>;
  
  // Transaction hashes
  transactions: {
    start?: string;
    lock?: string;
    resolve?: string;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const roundSchema = new Schema<IRound>({
  roundId: {
    type: Number,
    required: true,
    unique: true,
    min: 1
  },
  startTime: {
    type: Date,
    required: true
  },
  lockTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  startPrice: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        return parseFloat(v) > 0;
      },
      message: 'Start price must be greater than 0'
    }
  },
  lockPrice: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || parseFloat(v) > 0;
      },
      message: 'Lock price must be greater than 0'
    }
  },
  endPrice: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || parseFloat(v) > 0;
      },
      message: 'End price must be greater than 0'
    }
  },
  totalUpAmount: {
    type: String,
    default: '0'
  },
  totalDownAmount: {
    type: String,
    default: '0'
  },
  rewardAmount: {
    type: String,
    default: '0'
  },
  state: {
    type: String,
    enum: ['ACTIVE', 'LOCKED', 'RESOLVED', 'CANCELLED'],
    default: 'ACTIVE'
  },
  resolved: {
    type: Boolean,
    default: false
  },
  winningPosition: {
    type: String,
    enum: ['UP', 'DOWN']
  },
  participantCount: {
    type: Number,
    default: 0
  },
  upParticipants: {
    type: Number,
    default: 0
  },
  downParticipants: {
    type: Number,
    default: 0
  },
  priceHistory: [{
    timestamp: {
      type: Date,
      required: true
    },
    price: {
      type: String,
      required: true
    },
    source: {
      type: String,
      required: true,
      default: 'coingecko'
    }
  }],
  transactions: {
    start: String,
    lock: String,
    resolve: String
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes
roundSchema.index({ roundId: 1 }, { unique: true });
roundSchema.index({ state: 1 });
roundSchema.index({ startTime: -1 });
roundSchema.index({ endTime: 1 });
roundSchema.index({ resolved: 1 });

// Virtual fields
roundSchema.virtual('totalAmount').get(function() {
  return (parseFloat(this.totalUpAmount) + parseFloat(this.totalDownAmount)).toString();
});

roundSchema.virtual('upPercentage').get(function() {
  const total = parseFloat(this.totalUpAmount) + parseFloat(this.totalDownAmount);
  return total > 0 ? (parseFloat(this.totalUpAmount) / total) * 100 : 0;
});

roundSchema.virtual('downPercentage').get(function() {
  const total = parseFloat(this.totalUpAmount) + parseFloat(this.totalDownAmount);
  return total > 0 ? (parseFloat(this.totalDownAmount) / total) * 100 : 0;
});

roundSchema.virtual('priceChange').get(function() {
  if (!this.lockPrice || !this.endPrice) return null;
  const lockPrice = parseFloat(this.lockPrice);
  const endPrice = parseFloat(this.endPrice);
  return ((endPrice - lockPrice) / lockPrice) * 100;
});

roundSchema.virtual('duration').get(function() {
  return this.endTime.getTime() - this.startTime.getTime();
});

roundSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.state === 'ACTIVE' && now < this.lockTime;
});

roundSchema.virtual('isLocked').get(function() {
  const now = new Date();
  return this.state === 'LOCKED' || (this.state === 'ACTIVE' && now >= this.lockTime && now < this.endTime);
});

roundSchema.virtual('canResolve').get(function() {
  const now = new Date();
  return this.state === 'LOCKED' && now >= this.endTime;
});

// Methods
roundSchema.methods.addPricePoint = function(price: string, source: string = 'coingecko') {
  this.priceHistory.push({
    timestamp: new Date(),
    price,
    source
  });
  
  // Keep only last 100 price points to avoid document size issues
  if (this.priceHistory.length > 100) {
    this.priceHistory = this.priceHistory.slice(-100);
  }
  
  return this.save();
};

roundSchema.methods.updateParticipants = function(position: 'UP' | 'DOWN', isNew: boolean = true) {
  if (isNew) {
    this.participantCount += 1;
    if (position === 'UP') {
      this.upParticipants += 1;
    } else {
      this.downParticipants += 1;
    }
  }
  return this.save();
};

// Static methods
roundSchema.statics.getCurrentRound = function() {
  return this.findOne({
    state: { $in: ['ACTIVE', 'LOCKED'] }
  }).sort({ roundId: -1 });
};

roundSchema.statics.getActiveRounds = function() {
  return this.find({
    state: 'ACTIVE',
    lockTime: { $gt: new Date() }
  }).sort({ roundId: -1 });
};

roundSchema.statics.getRecentRounds = function(limit: number = 10) {
  return this.find({
    resolved: true
  }).sort({ roundId: -1 }).limit(limit);
};

roundSchema.statics.getRoundsForResolution = function() {
  return this.find({
    state: 'LOCKED',
    endTime: { $lte: new Date() },
    resolved: false
  });
};

export default mongoose.model<IRound>('Round', roundSchema);
