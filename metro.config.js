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

  // Web-only: `react-native-web-webview` (optional peer of
  // react-native-youtube-iframe's web build) is not installed, and its missing
  // import fails the whole web bundle. Stub it so non-YouTube surfaces preview
  // in a browser. Native builds are unaffected.
  if (platform === 'web' && moduleName === 'react-native-web-webview') {
    return {
      filePath: path.join(__dirname, 'web-shims/react-native-web-webview.js'),
      type: 'sourceFile',
    };
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });
