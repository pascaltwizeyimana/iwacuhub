module.exports = function override(config, env) {
  // Remove all HMR entries from webpack config
  if (config.entry) {
    // Handle different entry formats
    if (typeof config.entry === 'string') {
      config.entry = [config.entry];
    }
    
    if (Array.isArray(config.entry)) {
      config.entry = config.entry.filter(entry => 
        !entry.includes('webpack/hot') && 
        !entry.includes('webpack-dev-server/client')
      );
    } else if (typeof config.entry === 'object') {
      Object.keys(config.entry).forEach(key => {
        if (Array.isArray(config.entry[key])) {
          config.entry[key] = config.entry[key].filter(entry => 
            !entry.includes('webpack/hot') && 
            !entry.includes('webpack-dev-server/client')
          );
        }
      });
    }
  }
  
  // Remove HMR plugin
  if (config.plugins) {
    config.plugins = config.plugins.filter(plugin => 
      plugin.constructor.name !== 'HotModuleReplacementPlugin'
    );
  }
  
  // Disable HMR in dev server
  if (config.devServer) {
    config.devServer.hot = false;
    config.devServer.liveReload = false;
  }
  
  return config;
};