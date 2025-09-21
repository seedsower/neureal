#!/bin/bash

# Comprehensive import path fix for React build
echo "🔧 Comprehensive import path fix..."

cd frontend/src

# Fix all @/ imports with proper relative paths
echo "📝 Fixing all @/ imports..."

# Components directory (depth 2 from src)
find components/ -name "*.tsx" -exec sed -i 's|@/components/UI/|../UI/|g' {} \;
find components/ -name "*.tsx" -exec sed -i 's|@/components/|../|g' {} \;

# Pages directory (depth 1 from src)  
find pages/ -name "*.tsx" -exec sed -i 's|@/components/|../components/|g' {} \;

# All other @/ patterns
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|@/store/appStore|../store/appStore|g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|@/types|../types|g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|@/utils/|../utils/|g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|@/services/|../services/|g'
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|@/hooks/|../hooks/|g'

cd ../..

echo "✅ All import paths fixed"

# Test the build
echo "🧪 Testing build..."
cd frontend && npm run build
