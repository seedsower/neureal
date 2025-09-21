#!/bin/bash

# Neureal Local Development Startup Script
set -e

echo "🚀 Starting Neureal dApp locally..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Check if .env files exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️ Creating .env from example...${NC}"
    cp .env.example .env
fi

if [ ! -f frontend/.env ]; then
    echo -e "${YELLOW}⚠️ Creating frontend/.env from example...${NC}"
    cp frontend/.env.example frontend/.env
fi

# Start databases first
echo -e "${GREEN}📊 Starting databases...${NC}"
docker-compose up -d mongodb redis

# Wait for databases to be ready
echo "⏳ Waiting for databases to be ready..."
sleep 10

# Check if node_modules exist, install if not
echo -e "${GREEN}📦 Checking dependencies...${NC}"

if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

# Start backend
echo -e "${GREEN}⚙️ Starting backend server...${NC}"
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Start frontend
echo -e "${GREEN}🎨 Starting frontend...${NC}"
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

# Function to cleanup processes on exit
cleanup() {
    echo -e "\n${YELLOW}🧹 Cleaning up...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    docker-compose stop mongodb redis
}

# Set trap for cleanup on exit
trap cleanup EXIT INT TERM

# Wait and show status
sleep 10

echo ""
echo "=================================="
echo -e "${GREEN}🎉 Neureal dApp is starting up!${NC}"
echo "=================================="
echo ""
echo "📊 Services:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend API: http://localhost:3001"
echo "  - API Health: http://localhost:3001/health"
echo ""
echo "🔗 Database Services:"
echo "  - MongoDB: mongodb://localhost:27017/neureal"
echo "  - Redis: redis://localhost:6379"
echo ""
echo -e "${YELLOW}📝 Note: This is a development setup without smart contracts.${NC}"
echo -e "${YELLOW}   To deploy contracts, run: cd contracts && npm install && npm run deploy:local${NC}"
echo ""
echo "Press Ctrl+C to stop all services"

# Keep script running and show logs
wait
