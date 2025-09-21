#!/bin/bash

# Neureal Deployment Script
# This script deploys the complete Neureal dApp to production

set -e

echo "🚀 Starting Neureal deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required environment variables are set
check_env_vars() {
    echo "📋 Checking environment variables..."
    
    required_vars=(
        "PRIVATE_KEY"
        "BASE_RPC_URL"
        "MONGODB_URI"
        "REDIS_URL"
        "JWT_SECRET"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            echo -e "${RED}❌ Error: $var is not set${NC}"
            exit 1
        fi
    done
    
    echo -e "${GREEN}✅ All required environment variables are set${NC}"
}

# Deploy smart contracts
deploy_contracts() {
    echo "📝 Deploying smart contracts..."
    
    cd contracts
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing contract dependencies..."
        npm install
    fi
    
    # Compile contracts
    echo "🔨 Compiling contracts..."
    npm run compile
    
    # Deploy to Base network
    echo "🌐 Deploying to Base network..."
    npm run deploy:base
    
    echo -e "${GREEN}✅ Smart contracts deployed successfully${NC}"
    cd ..
}

# Setup backend
setup_backend() {
    echo "⚙️ Setting up backend..."
    
    cd backend
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing backend dependencies..."
        npm install
    fi
    
    # Build backend
    echo "🔨 Building backend..."
    npm run build
    
    echo -e "${GREEN}✅ Backend setup complete${NC}"
    cd ..
}

# Setup frontend
setup_frontend() {
    echo "🎨 Setting up frontend..."
    
    cd frontend
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing frontend dependencies..."
        npm install
    fi
    
    # Build frontend
    echo "🔨 Building frontend..."
    npm run build
    
    echo -e "${GREEN}✅ Frontend built successfully${NC}"
    cd ..
}

# Start services
start_services() {
    echo "🚀 Starting services..."
    
    # Start backend in background
    cd backend
    echo "🔄 Starting backend server..."
    npm start &
    BACKEND_PID=$!
    echo "Backend started with PID: $BACKEND_PID"
    cd ..
    
    # Start frontend (for development)
    if [ "$NODE_ENV" != "production" ]; then
        cd frontend
        echo "🔄 Starting frontend development server..."
        npm start &
        FRONTEND_PID=$!
        echo "Frontend started with PID: $FRONTEND_PID"
        cd ..
    fi
    
    echo -e "${GREEN}✅ Services started successfully${NC}"
}

# Health check
health_check() {
    echo "🏥 Performing health check..."
    
    # Wait a moment for services to start
    sleep 5
    
    # Check backend health
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is healthy${NC}"
    else
        echo -e "${RED}❌ Backend health check failed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Health check passed${NC}"
}

# Cleanup function
cleanup() {
    echo "🧹 Cleaning up..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
}

# Set trap for cleanup on exit
trap cleanup EXIT

# Main deployment flow
main() {
    echo "🎯 Neureal Deployment Starting..."
    echo "=================================="
    
    check_env_vars
    
    if [ "$1" = "--contracts-only" ]; then
        deploy_contracts
        echo -e "${GREEN}🎉 Contract deployment complete!${NC}"
        exit 0
    fi
    
    if [ "$1" = "--no-contracts" ]; then
        echo -e "${YELLOW}⚠️ Skipping contract deployment${NC}"
    else
        deploy_contracts
    fi
    
    setup_backend
    setup_frontend
    
    if [ "$1" != "--build-only" ]; then
        start_services
        health_check
        
        echo "=================================="
        echo -e "${GREEN}🎉 Neureal deployment complete!${NC}"
        echo ""
        echo "📊 Services:"
        echo "  - Backend: http://localhost:3001"
        echo "  - Frontend: http://localhost:3000"
        echo "  - API Docs: http://localhost:3001/api/v1"
        echo ""
        echo "📝 Next steps:"
        echo "  1. Update contract addresses in frontend/.env"
        echo "  2. Configure your wallet to connect to Base network"
        echo "  3. Get NEURAL tokens to start predicting"
        echo ""
        echo "Press Ctrl+C to stop services"
        
        # Keep script running
        wait
    else
        echo -e "${GREEN}🎉 Build complete!${NC}"
    fi
}

# Parse command line arguments
case "$1" in
    --help|-h)
        echo "Neureal Deployment Script"
        echo ""
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --contracts-only    Deploy only smart contracts"
        echo "  --no-contracts      Skip contract deployment"
        echo "  --build-only        Build without starting services"
        echo "  --help, -h          Show this help message"
        echo ""
        exit 0
        ;;
    *)
        main "$1"
        ;;
esac
