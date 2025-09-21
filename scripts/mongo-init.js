// MongoDB initialization script for Neureal
db = db.getSiblingDB('neureal');

// Create collections with proper indexes
db.createCollection('users');
db.createCollection('rounds');
db.createCollection('predictions');

// Create indexes for users collection
db.users.createIndex({ "address": 1 }, { unique: true });
db.users.createIndex({ "createdAt": -1 });
db.users.createIndex({ "stats.totalWinnings": -1 });
db.users.createIndex({ "stats.winRate": -1 });
db.users.createIndex({ "stats.maxWinStreak": -1 });
db.users.createIndex({ "isActive": 1 });

// Create indexes for rounds collection
db.rounds.createIndex({ "roundId": 1 }, { unique: true });
db.rounds.createIndex({ "state": 1 });
db.rounds.createIndex({ "startTime": -1 });
db.rounds.createIndex({ "endTime": 1 });
db.rounds.createIndex({ "resolved": 1 });

// Create indexes for predictions collection
db.predictions.createIndex({ "user": 1, "roundId": 1 }, { unique: true });
db.predictions.createIndex({ "roundId": 1 });
db.predictions.createIndex({ "user": 1, "predictedAt": -1 });
db.predictions.createIndex({ "transactionHash": 1 }, { unique: true });
db.predictions.createIndex({ "claimed": 1, "claimableAmount": 1 });
db.predictions.createIndex({ "position": 1, "roundId": 1 });
db.predictions.createIndex({ "isWinning": 1 });

print('✅ Neureal database initialized successfully');
print('📊 Collections created: users, rounds, predictions');
print('🔍 Indexes created for optimal query performance');
