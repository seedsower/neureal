#!/bin/bash

# Test build script for Netlify deployment
echo "🧪 Testing Neureal frontend build for Netlify..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if we're in the right directory
if [ ! -f "netlify.toml" ]; then
    echo -e "${RED}❌ netlify.toml not found. Please run from the project root.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Found netlify.toml configuration${NC}"

# Navigate to frontend
cd frontend

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ frontend/package.json not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Found frontend package.json${NC}"

# Install dependencies with legacy peer deps to avoid conflicts
echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
npm install --legacy-peer-deps

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependencies installed successfully${NC}"

# Set production environment
export NODE_ENV=production

# Build the project
echo -e "${YELLOW}🔨 Building React application...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"

# Check build output
if [ -d "build" ]; then
    BUILD_SIZE=$(du -sh build | cut -f1)
    FILE_COUNT=$(find build -type f | wc -l)
    echo -e "${GREEN}📊 Build statistics:${NC}"
    echo "   - Build size: $BUILD_SIZE"
    echo "   - File count: $FILE_COUNT"
    echo "   - Build directory: frontend/build"
else
    echo -e "${RED}❌ Build directory not found${NC}"
    exit 1
fi

# Test if index.html exists
if [ -f "build/index.html" ]; then
    echo -e "${GREEN}✅ index.html found in build directory${NC}"
else
    echo -e "${RED}❌ index.html not found in build directory${NC}"
    exit 1
fi

echo ""
echo "=================================="
echo -e "${GREEN}🎉 Build test completed successfully!${NC}"
echo "=================================="
echo ""
echo "📁 Build output ready for Netlify deployment:"
echo "   - Directory: frontend/build"
echo "   - Size: $BUILD_SIZE"
echo "   - Files: $FILE_COUNT"
echo ""
echo "🚀 Ready to deploy to Netlify!"
echo ""
echo "Next steps:"
echo "1. Go to https://netlify.com"
echo "2. Connect your GitHub repository: https://github.com/seedsower/neureal"
echo "3. Netlify will auto-detect the netlify.toml configuration"
echo "4. Deploy!"

cd ..
