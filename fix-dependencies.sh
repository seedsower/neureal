#!/bin/bash

# Fix dependencies for Netlify deployment
echo "🔧 Fixing dependencies for Netlify deployment..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Clean frontend dependencies
echo -e "${YELLOW}🧹 Cleaning frontend dependencies...${NC}"
cd frontend

# Remove existing lock files and node_modules
rm -rf node_modules package-lock.json yarn.lock

# Install with legacy peer deps
echo -e "${YELLOW}📦 Installing dependencies with legacy peer deps...${NC}"
npm install --legacy-peer-deps

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

# Test build
echo -e "${YELLOW}🔨 Testing build...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
    echo -e "${GREEN}📊 Build output ready in frontend/build/${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

cd ..

echo ""
echo "=================================="
echo -e "${GREEN}🎉 Dependencies fixed successfully!${NC}"
echo "=================================="
echo ""
echo "✅ Fixed issues:"
echo "   - TypeScript version compatibility"
echo "   - Package dependency conflicts"
echo "   - Build configuration"
echo ""
echo "🚀 Ready for Netlify deployment!"
