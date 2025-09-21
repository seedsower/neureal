import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  address: string;
  nonce: string;
  isActive: boolean;
  lastLoginAt: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Profile information
  username?: string;
  avatar?: string;
  bio?: string;
  
  // Statistics (cached from blockchain)
  stats: {
    totalStaked: string;
    totalWinnings: string;
    currentWinStreak: number;
    maxWinStreak: number;
    totalRounds: number;
    wonRounds: number;
    winRate: number;
    roi: number; // Return on investment percentage
  };
  
  // Preferences
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
      roundStart: boolean;
      roundEnd: boolean;
      winnings: boolean;
    };
    theme: 'dark' | 'light';
    currency: 'USD' | 'ETH' | 'NEURAL';
  };
  
  // Methods
  generateNonce(): string;
  updateStats(stats: any): Promise<IUser>;
}

const userSchema = new Schema<IUser>({
  address: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: function(v: string) {
        return /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: 'Invalid Ethereum address format'
    }
  },
  nonce: {
    type: String,
    required: true,
    default: () => Math.floor(Math.random() * 1000000).toString()
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLoginAt: {
    type: Date,
    default: Date.now
  },
  username: {
    type: String,
    trim: true,
    maxlength: 50
  },
  avatar: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 500
  },
  stats: {
    totalStaked: {
      type: String,
      default: '0'
    },
    totalWinnings: {
      type: String,
      default: '0'
    },
    currentWinStreak: {
      type: Number,
      default: 0
    },
    maxWinStreak: {
      type: Number,
      default: 0
    },
    totalRounds: {
      type: Number,
      default: 0
    },
    wonRounds: {
      type: Number,
      default: 0
    },
    winRate: {
      type: Number,
      default: 0
    },
    roi: {
      type: Number,
      default: 0
    }
  },
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      },
      roundStart: {
        type: Boolean,
        default: true
      },
      roundEnd: {
        type: Boolean,
        default: true
      },
      winnings: {
        type: Boolean,
        default: true
      }
    },
    theme: {
      type: String,
      enum: ['dark', 'light'],
      default: 'dark'
    },
    currency: {
      type: String,
      enum: ['USD', 'ETH', 'NEURAL'],
      default: 'NEURAL'
    }
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
userSchema.index({ address: 1 }, { unique: true });
userSchema.index({ createdAt: -1 });
userSchema.index({ 'stats.totalWinnings': -1 });
userSchema.index({ 'stats.winRate': -1 });

// Methods
userSchema.methods.generateNonce = function(): string {
  this.nonce = Math.floor(Math.random() * 1000000).toString();
  return this.nonce;
};

userSchema.methods.updateStats = async function(newStats: any): Promise<IUser> {
  this.stats = {
    ...this.stats,
    ...newStats,
    winRate: newStats.totalRounds > 0 ? (newStats.wonRounds / newStats.totalRounds) * 100 : 0,
    roi: parseFloat(newStats.totalStaked) > 0 ? 
      ((parseFloat(newStats.totalWinnings) - parseFloat(newStats.totalStaked)) / parseFloat(newStats.totalStaked)) * 100 : 0
  };
  return await this.save();
};

// Static methods
userSchema.statics.findByAddress = function(address: string) {
  return this.findOne({ address: address.toLowerCase() });
};

userSchema.statics.getLeaderboard = function(limit: number = 10, sortBy: string = 'totalWinnings') {
  const sortField = `stats.${sortBy}`;
  return this.find({ isActive: true })
    .sort({ [sortField]: -1 })
    .limit(limit)
    .select('address username avatar stats createdAt');
};

export default mongoose.model<IUser>('User', userSchema);
