const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);
const defaultResolveRequest = config.resolver.resolveRequest;
const zustandCjsAliases = {
  zustand: path.join(__dirname, 'node_modules/zustand/index.js'),
  'zustand/middleware': path.join(__dirname, 'node_modules/zustand/middleware.js'),
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (zustandCjsAliases[moduleName]) {
    return {
      filePath: zustandCjsAliases[moduleName],
      type: 'sourceFile',
    };
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });
