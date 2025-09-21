// Temporary fix for schema-utils/ajv compatibility issues
const fs = require('fs');
const path = require('path');

// Patch the problematic fork-ts-checker-webpack-plugin
const pluginPath = path.join(__dirname, 'node_modules', 'fork-ts-checker-webpack-plugin', 'lib', 'ForkTsCheckerWebpackPlugin.js');

if (fs.existsSync(pluginPath)) {
  let content = fs.readFileSync(pluginPath, 'utf8');
  
  // Replace the problematic schema validation call
  content = content.replace(
    'schema_utils_1.default(ForkTsCheckerWebpackPluginOptions_json_1.default, options, configuration);',
    '// schema_utils_1.default(ForkTsCheckerWebpackPluginOptions_json_1.default, options, configuration);'
  );
  
  fs.writeFileSync(pluginPath, content);
  console.log('✅ Patched fork-ts-checker-webpack-plugin');
} else {
  console.log('⚠️ fork-ts-checker-webpack-plugin not found, skipping patch');
}

// Run the actual build
const { spawn } = require('child_process');
const build = spawn('npm', ['run', 'build:original'], { stdio: 'inherit' });

build.on('close', (code) => {
  process.exit(code);
});
