import mongoose, { Document, Schema } from 'mongoose';

export interface IPrediction extends Document {
  user: string; // User's wallet address
  roundId: number;
  position: 'UP' | 'DOWN';
  amount: string; // Amount staked in NEURAL tokens
  claimed: boolean;
  claimableAmount: string;
  
  // Transaction information
  transactionHash: string;
  blockNumber?: number;
  gasUsed?: string;
  gasPrice?: string;
  
  // Timestamps
  predictedAt: Date;
  claimedAt?: Date;
  
  // Metadata
  isWinning?: boolean;
  payout?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const predictionSchema = new Schema<IPrediction>({
  user: {
    type: String,
    required: true,
    lowercase: true,
    validate: {
      validator: function(v: string) {
        return /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: 'Invalid Ethereum address format'
    }
  },
  roundId: {
    type: Number,
    required: true,
    min: 1
  },
  position: {
    type: String,
    required: true,
    enum: ['UP', 'DOWN']
  },
  amount: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        return parseFloat(v) > 0;
      },
      message: 'Amount must be greater than 0'
    }
  },
  claimed: {
    type: Boolean,
    default: false
  },
  claimableAmount: {
    type: String,
    default: '0'
  },
  transactionHash: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^0x[a-fA-F0-9]{64}$/.test(v);
      },
      message: 'Invalid transaction hash format'
    }
  },
  blockNumber: {
    type: Number,
    min: 0
  },
  gasUsed: {
    type: String
  },
  gasPrice: {
    type: String
  },
  predictedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  claimedAt: {
    type: Date
  },
  isWinning: {
    type: Boolean
  },
  payout: {
    type: String,
    default: '0'
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

// Compound indexes
predictionSchema.index({ user: 1, roundId: 1 }, { unique: true });
predictionSchema.index({ roundId: 1 });
predictionSchema.index({ user: 1, predictedAt: -1 });
predictionSchema.index({ transactionHash: 1 }, { unique: true });
predictionSchema.index({ claimed: 1, claimableAmount: 1 });
predictionSchema.index({ position: 1, roundId: 1 });

// Virtual fields
predictionSchema.virtual('roi').get(function() {
  if (!this.payout || parseFloat(this.amount) === 0) return 0;
  return ((parseFloat(this.payout) - parseFloat(this.amount)) / parseFloat(this.amount)) * 100;
});

predictionSchema.virtual('profit').get(function() {
  if (!this.payout) return '0';
  return (parseFloat(this.payout) - parseFloat(this.amount)).toString();
});

// Methods
predictionSchema.methods.markAsWinning = function(claimableAmount: string) {
  this.isWinning = true;
  this.claimableAmount = claimableAmount;
  this.payout = claimableAmount;
  return this.save();
};

predictionSchema.methods.markAsLosing = function() {
  this.isWinning = false;
  this.claimableAmount = '0';
  this.payout = '0';
  return this.save();
};

predictionSchema.methods.markAsClaimed = function() {
  this.claimed = true;
  this.claimedAt = new Date();
  return this.save();
};

// Static methods
predictionSchema.statics.findByUser = function(userAddress: string, limit: number = 50) {
  return this.find({ user: userAddress.toLowerCase() })
    .sort({ predictedAt: -1 })
    .limit(limit);
};

predictionSchema.statics.findByRound = function(roundId: number) {
  return this.find({ roundId }).sort({ predictedAt: -1 });
};

predictionSchema.statics.findUserPredictionForRound = function(userAddress: string, roundId: number) {
  return this.findOne({ 
    user: userAddress.toLowerCase(), 
    roundId 
  });
};

predictionSchema.statics.getUnclaimedPredictions = function(userAddress: string) {
  return this.find({
    user: userAddress.toLowerCase(),
    claimed: false,
    isWinning: true,
    claimableAmount: { $gt: '0' }
  }).sort({ predictedAt: -1 });
};

predictionSchema.statics.getRoundStatistics = function(roundId: number) {
  return this.aggregate([
    { $match: { roundId } },
    {
      $group: {
        _id: '$position',
        count: { $sum: 1 },
        totalAmount: { $sum: { $toDouble: '$amount' } },
        avgAmount: { $avg: { $toDouble: '$amount' } }
      }
    }
  ]);
};

predictionSchema.statics.getUserStatistics = function(userAddress: string) {
  return this.aggregate([
    { $match: { user: userAddress.toLowerCase() } },
    {
      $group: {
        _id: null,
        totalPredictions: { $sum: 1 },
        totalStaked: { $sum: { $toDouble: '$amount' } },
        totalWinnings: { 
          $sum: { 
            $cond: [
              { $eq: ['$isWinning', true] },
              { $toDouble: '$payout' },
              0
            ]
          }
        },
        winningPredictions: {
          $sum: {
            $cond: [{ $eq: ['$isWinning', true] }, 1, 0]
          }
        },
        upPredictions: {
          $sum: {
            $cond: [{ $eq: ['$position', 'UP'] }, 1, 0]
          }
        },
        downPredictions: {
          $sum: {
            $cond: [{ $eq: ['$position', 'DOWN'] }, 1, 0]
          }
        }
      }
    },
    {
      $addFields: {
        winRate: {
          $cond: [
            { $gt: ['$totalPredictions', 0] },
            { $multiply: [{ $divide: ['$winningPredictions', '$totalPredictions'] }, 100] },
            0
          ]
        },
        roi: {
          $cond: [
            { $gt: ['$totalStaked', 0] },
            { $multiply: [{ $divide: [{ $subtract: ['$totalWinnings', '$totalStaked'] }, '$totalStaked'] }, 100] },
            0
          ]
        }
      }
    }
  ]);
};

export default mongoose.model<IPrediction>('Prediction', predictionSchema);
