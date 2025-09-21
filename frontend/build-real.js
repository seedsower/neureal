// Build script for the real React app with fixes
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🔧 Preparing React build with comprehensive fixes...');

// Apply comprehensive webpack fixes
require('./comprehensive-fix.js');

// Set environment variables for build
process.env.SKIP_PREFLIGHT_CHECK = 'true';
process.env.CI = 'false';
process.env.GENERATE_SOURCEMAP = 'false';
process.env.TSC_COMPILE_ON_ERROR = 'true';
process.env.ESLINT_NO_DEV_ERRORS = 'true';

console.log('🚀 Starting React build...');

// Run the actual React build
const build = spawn('npx', ['react-scripts', 'build'], {
  stdio: 'inherit',
  env: process.env
});

build.on('close', (code) => {
  if (code === 0) {
    console.log('✅ React build completed successfully!');
  } else {
    console.log('❌ React build failed with code:', code);
  }
  process.exit(code);
});
