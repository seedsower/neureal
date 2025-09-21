#!/bin/bash

# Simple Neureal dApp Startup (No Docker Required)
set -e

echo "🚀 Starting Neureal dApp (Simple Mode)..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version) detected${NC}"

# Create simple environment files if they don't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️ Creating .env file...${NC}"
    cat > .env << 'EOF'
NODE_ENV=development
PORT=3001
JWT_SECRET=neureal_local_dev_secret
MONGODB_URI=memory://localhost
REDIS_URL=memory://localhost
ENABLE_CRON_JOBS=false
LOG_LEVEL=debug
EOF
fi

if [ ! -f frontend/.env ]; then
    echo -e "${YELLOW}⚠️ Creating frontend/.env file...${NC}"
    cat > frontend/.env << 'EOF'
REACT_APP_API_URL=http://localhost:3001/api/v1
REACT_APP_WS_URL=ws://localhost:3002
REACT_APP_CHAIN_ID=8453
GENERATE_SOURCEMAP=true
EOF
fi

# Install dependencies
echo -e "${GREEN}📦 Installing dependencies...${NC}"

if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

# Create a simple mock backend for demo purposes
echo -e "${GREEN}⚙️ Creating mock backend...${NC}"
cat > backend/mock-server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] }
});

app.use(cors());
app.use(express.json());

// Mock data
let mockPrice = 0.15;
let mockRound = {
  roundId: 1,
  startTime: Date.now(),
  lockTime: Date.now() + 24 * 60 * 60 * 1000,
  endTime: Date.now() + 48 * 60 * 60 * 1000,
  startPrice: mockPrice.toString(),
  totalUpAmount: "1000",
  totalDownAmount: "800",
  state: "ACTIVE",
  statistics: { totalParticipants: 18 }
};

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/v1/rounds/current', (req, res) => {
  res.json({ success: true, data: mockRound });
});

app.get('/api/v1/stats/platform', (req, res) => {
  res.json({
    success: true,
    data: {
      overview: {
        totalUsers: 1234,
        activeUsers: 567,
        totalRounds: 89,
        totalVolume: "2500000"
      }
    }
  });
});

app.post('/api/v1/auth/nonce', (req, res) => {
  res.json({ success: true, data: { nonce: "123456" } });
});

app.post('/api/v1/predictions', (req, res) => {
  res.json({ success: true, message: 'Prediction recorded (mock)' });
});

// WebSocket for real-time updates
io.on('connection', (socket) => {
  console.log('Client connected');
  
  // Send price updates every 5 seconds
  const priceInterval = setInterval(() => {
    mockPrice += (Math.random() - 0.5) * 0.01;
    socket.emit('price_update', {
      price: mockPrice.toFixed(6),
      change24h: (Math.random() - 0.5) * 10,
      timestamp: Date.now()
    });
  }, 5000);
  
  socket.on('disconnect', () => {
    clearInterval(priceInterval);
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3001;
const WS_PORT = process.env.WS_PORT || 3002;

server.listen(WS_PORT, () => {
  console.log(`🔌 WebSocket server running on port ${WS_PORT}`);
});

app.listen(PORT, () => {
  console.log(`🚀 Mock API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
EOF

# Start mock backend
echo -e "${GREEN}🔧 Starting mock backend...${NC}"
cd backend
node mock-server.js &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
echo -e "${GREEN}🎨 Starting frontend...${NC}"
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}🧹 Cleaning up...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
}

trap cleanup EXIT INT TERM

# Show status
sleep 5
echo ""
echo "=================================="
echo -e "${GREEN}🎉 Neureal dApp is running!${NC}"
echo "=================================="
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔌 Backend API: http://localhost:3001"
echo "📊 Health Check: http://localhost:3001/health"
echo ""
echo -e "${YELLOW}📝 Note: This is a demo mode with mock data${NC}"
echo -e "${YELLOW}   - No real blockchain interactions${NC}"
echo -e "${YELLOW}   - Mock price updates every 5 seconds${NC}"
echo -e "${YELLOW}   - Simulated prediction market data${NC}"
echo ""
echo "Press Ctrl+C to stop all services"

wait
EOF
