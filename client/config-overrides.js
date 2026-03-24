module.exports = function override(config, env) {
  // Remove the HMR entry points
  if (config.entry && Array.isArray(config.entry)) {
    config.entry = config.entry.filter(
      entry => !entry.includes('webpack/hot/dev-server')
    );
  } else if (config.entry && typeof config.entry === 'object') {
    Object.keys(config.entry).forEach(key => {
      if (Array.isArray(config.entry[key])) {
        config.entry[key] = config.entry[key].filter(
          entry => !entry.includes('webpack/hot/dev-server')
        );
      }
    });
  }
  
  return config;
};