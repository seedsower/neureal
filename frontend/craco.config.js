// CRACO config to override webpack and fix AJV issues
const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Disable TypeScript checking to avoid schema-utils issues
      webpackConfig.plugins = webpackConfig.plugins.filter(
        plugin => plugin.constructor.name !== 'ForkTsCheckerWebpackPlugin'
      );

      // Add fallbacks for Node.js modules
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "crypto": false,
        "stream": false,
        "buffer": false,
        "util": false
      };

      // Ignore source maps to reduce build complexity
      if (env === 'production') {
        webpackConfig.devtool = false;
      }

      return webpackConfig;
    }
  },
  typescript: {
    enableTypeChecking: false
  }
};
