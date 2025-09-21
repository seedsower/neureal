#!/bin/bash

# Fix import paths for React build compatibility
echo "🔧 Fixing import paths for build compatibility..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

cd frontend/src

# Fix imports in different directories
echo -e "${YELLOW}📝 Fixing imports in pages/...${NC}"
find pages/ -name "*.tsx" -exec sed -i "s|@/config/constants|../config/constants|g" {} \;
find pages/ -name "*.tsx" -exec sed -i "s|@/components/|../components/|g" {} \;
find pages/ -name "*.tsx" -exec sed -i "s|@/hooks/|../hooks/|g" {} \;

echo -e "${YELLOW}📝 Fixing imports in components/...${NC}"
find components/ -name "*.tsx" -exec sed -i "s|@/config/constants|../../config/constants|g" {} \;
find components/ -name "*.tsx" -exec sed -i "s|@/store/|../../store/|g" {} \;
find components/ -name "*.tsx" -exec sed -i "s|@/types|../../types|g" {} \;
find components/ -name "*.tsx" -exec sed -i "s|@/utils/|../../utils/|g" {} \;
find components/ -name "*.tsx" -exec sed -i "s|@/hooks/|../../hooks/|g" {} \;
find components/ -name "*.tsx" -exec sed -i "s|@/services/|../../services/|g" {} \;

echo -e "${YELLOW}📝 Fixing imports in hooks/...${NC}"
find hooks/ -name "*.ts" -exec sed -i "s|@/config/constants|../config/constants|g" {} \;
find hooks/ -name "*.ts" -exec sed -i "s|@/store/|../store/|g" {} \;
find hooks/ -name "*.ts" -exec sed -i "s|@/types|../types|g" {} \;
find hooks/ -name "*.ts" -exec sed -i "s|@/services/|../services/|g" {} \;

echo -e "${YELLOW}📝 Fixing imports in services/...${NC}"
find services/ -name "*.ts" -exec sed -i "s|@/config/constants|../config/constants|g" {} \;

echo -e "${YELLOW}📝 Fixing imports in store/...${NC}"
find store/ -name "*.ts" -exec sed -i "s|@/config/constants|../config/constants|g" {} \;
find store/ -name "*.ts" -exec sed -i "s|@/types|../types|g" {} \;

cd ../..

echo -e "${GREEN}✅ Import paths fixed for build compatibility${NC}"
echo "📝 All @/ aliases replaced with relative paths"
