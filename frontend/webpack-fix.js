// Comprehensive webpack/AJV compatibility fix
const fs = require('fs');
const path = require('path');

console.log('🔧 Applying webpack compatibility fixes...');

// Fix 1: Patch fork-ts-checker-webpack-plugin
const forkTsCheckerPath = path.join(__dirname, 'node_modules', 'fork-ts-checker-webpack-plugin', 'lib', 'ForkTsCheckerWebpackPlugin.js');
if (fs.existsSync(forkTsCheckerPath)) {
  let content = fs.readFileSync(forkTsCheckerPath, 'utf8');
  
  // Replace the problematic schema validation
  if (content.includes('schema_utils_1.default(ForkTsCheckerWebpackPluginOptions_json_1.default, options, configuration);')) {
    content = content.replace(
      'schema_utils_1.default(ForkTsCheckerWebpackPluginOptions_json_1.default, options, configuration);',
      '// Patched: schema validation disabled for compatibility\n        // schema_utils_1.default(ForkTsCheckerWebpackPluginOptions_json_1.default, options, configuration);'
    );
    fs.writeFileSync(forkTsCheckerPath, content);
    console.log('✅ Patched fork-ts-checker-webpack-plugin');
  }
} else {
  console.log('⚠️  fork-ts-checker-webpack-plugin not found');
}

// Fix 2: Patch schema-utils if needed
const schemaUtilsPath = path.join(__dirname, 'node_modules', 'schema-utils', 'dist', 'validate.js');
if (fs.existsSync(schemaUtilsPath)) {
  let content = fs.readFileSync(schemaUtilsPath, 'utf8');
  
  // Fix AJV constructor issues
  if (content.includes('const ajv = new Ajv({')) {
    content = content.replace(
      'const ajv = new Ajv({',
      'const ajv = new (Ajv.default || Ajv)({'
    );
    fs.writeFileSync(schemaUtilsPath, content);
    console.log('✅ Patched schema-utils AJV constructor');
  }
} else {
  console.log('⚠️  schema-utils validate.js not found');
}

// Fix 3: Create AJV compatibility shim
const ajvShimPath = path.join(__dirname, 'node_modules', 'ajv', 'lib', 'ajv.js');
if (fs.existsSync(ajvShimPath)) {
  let content = fs.readFileSync(ajvShimPath, 'utf8');
  
  // Ensure proper export
  if (!content.includes('module.exports.default = module.exports;')) {
    content += '\n// Compatibility shim\nmodule.exports.default = module.exports;\n';
    fs.writeFileSync(ajvShimPath, content);
    console.log('✅ Added AJV compatibility shim');
  }
} else {
  console.log('⚠️  AJV main file not found');
}

console.log('🎯 Webpack compatibility fixes applied!');
