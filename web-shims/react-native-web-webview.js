// Local web-only shim for `react-native-web-webview`.
//
// That package is an optional peer of `react-native-youtube-iframe`'s web
// build and is not installed. It is only reached from tool concept bodies
// (LayeredConceptBody), never from Train/Today/Fuel. Because Expo Router
// bundles every route together, its missing import fails the ENTIRE web
// bundle — blocking browser preview of unrelated surfaces.
//
// This no-op lets the web bundle compile so those surfaces can be previewed
// in a browser. It is wired in metro.config.js for `platform === 'web'` only;
// native builds (the real target) resolve the true native WebView untouched.
const React = require('react');

function WebView(props) {
  return React.createElement('div', {
    style: { display: 'none' },
    'data-shim': 'react-native-web-webview',
    ...props,
  });
}

module.exports = WebView;
module.exports.WebView = WebView;
module.exports.default = WebView;
