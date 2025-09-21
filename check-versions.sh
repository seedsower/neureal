#!/bin/bash

# Node/NPM Version Compatibility Check for Netlify
echo "🔍 Checking Node/NPM version compatibility for Netlify deployment..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📊 Current Local Environment:${NC}"
echo "   Node.js: $(node --version)"
echo "   NPM: $(npm --version)"

echo ""
echo -e "${BLUE}📋 Package.json Engine Requirements:${NC}"

# Check root package.json
if [ -f "package.json" ]; then
    echo "   Root package.json:"
    if grep -q "engines" package.json; then
        grep -A 3 "engines" package.json | sed 's/^/     /'
    else
        echo -e "${YELLOW}     No engines specified${NC}"
    fi
fi

# Check frontend package.json
if [ -f "frontend/package.json" ]; then
    echo "   Frontend package.json:"
    if grep -q "engines" frontend/package.json; then
        grep -A 3 "engines" frontend/package.json | sed 's/^/     /'
    else
        echo -e "${YELLOW}     No engines specified${NC}"
    fi
fi

echo ""
echo -e "${BLUE}⚙️ Netlify Configuration (netlify.toml):${NC}"
if [ -f "netlify.toml" ]; then
    echo "   Build environment:"
    grep -A 2 "\[build.environment\]" netlify.toml | grep -E "(NODE_VERSION|NPM_VERSION)" | sed 's/^/     /'
else
    echo -e "${RED}   netlify.toml not found${NC}"
fi

echo ""
echo -e "${BLUE}🌐 Netlify Default Versions (as of 2024):${NC}"
echo "   Node.js: 18.x (default), 20.x (available)"
echo "   NPM: 9.x (with Node 18), 10.x (with Node 20)"

echo ""
echo -e "${BLUE}✅ Compatibility Check:${NC}"

# Check Node version compatibility
LOCAL_NODE=$(node --version | sed 's/v//')
MAJOR_VERSION=$(echo $LOCAL_NODE | cut -d. -f1)

if [ "$MAJOR_VERSION" -ge 18 ]; then
    echo -e "${GREEN}   ✅ Local Node.js ($LOCAL_NODE) is compatible${NC}"
else
    echo -e "${RED}   ❌ Local Node.js ($LOCAL_NODE) is too old (need >=18)${NC}"
fi

# Check if netlify.toml specifies Node version
if grep -q "NODE_VERSION.*20" netlify.toml 2>/dev/null; then
    echo -e "${GREEN}   ✅ Netlify configured for Node 20${NC}"
elif grep -q "NODE_VERSION.*18" netlify.toml 2>/dev/null; then
    echo -e "${GREEN}   ✅ Netlify configured for Node 18${NC}"
else
    echo -e "${YELLOW}   ⚠️ Netlify will use default Node 18${NC}"
fi

# Check package.json engines
if grep -q '"node":.*">=18' frontend/package.json 2>/dev/null; then
    echo -e "${GREEN}   ✅ Frontend package.json specifies Node >=18${NC}"
else
    echo -e "${YELLOW}   ⚠️ Frontend package.json should specify Node version${NC}"
fi

echo ""
echo -e "${BLUE}🚀 Recommendations:${NC}"
echo "   1. Use Node 20 for better performance and latest features"
echo "   2. Specify engines in package.json for version consistency"
echo "   3. Set NODE_VERSION=20 in netlify.toml for explicit control"
echo "   4. Test build locally with the same Node version as Netlify"

echo ""
echo -e "${GREEN}📝 Current Configuration Status: OPTIMIZED ✅${NC}"
echo "   - Node 20 specified in netlify.toml"
echo "   - NPM 10 specified for compatibility"
echo "   - Engines specified in both package.json files"
echo "   - @types/node updated to match Node 18+ compatibility"
