module.exports = {
  style: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
  webpack: {
    configure: (webpackConfig) => {
      // Optimize memory usage
      webpackConfig.optimization = {
        ...webpackConfig.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          minChunks: 1,
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          cacheGroups: {
            defaultVendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              reuseExistingChunk: true,
            },
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },
      };
      
      // Reduce memory usage by limiting source map generation
      if (process.env.NODE_ENV === 'development') {
        webpackConfig.devtool = 'eval-cheap-module-source-map';
        
        // Disable expensive source map processing
        webpackConfig.module.rules.forEach(rule => {
          if (rule.oneOf) {
            rule.oneOf.forEach(oneOfRule => {
              if (oneOfRule.loader && oneOfRule.loader.includes('source-map-loader')) {
                oneOfRule.exclude = /node_modules/;
              }
            });
          }
        });
      }
      
      // Add memory optimization for large libraries
      webpackConfig.resolve = {
        ...webpackConfig.resolve,
        alias: {
          ...webpackConfig.resolve.alias,
          // Reduce bundle size by using lighter versions
          'framer-motion': 'framer-motion/dist/framer-motion.js',
        },
      };
      
      return webpackConfig;
    },
    devServer: (devServerConfig) => {
      // Optimize dev server memory usage
      return {
        ...devServerConfig,
        hot: true,
        liveReload: false,
        client: {
          overlay: {
            errors: true,
            warnings: false,
          },
          logging: 'error',
        },
        // Reduce memory by not watching node_modules
        watchOptions: {
          ignored: /node_modules/,
          aggregateTimeout: 300,
          poll: 1000,
        },
      };
    },
  },
  // Optimize Jest for memory
  jest: {
    configure: (jestConfig) => {
      jestConfig.transformIgnorePatterns = [
        '[/\\\\]node_modules[/\\\\](?!(framer-motion|@framer)/)',
      ];
      return jestConfig;
    },
  },
};