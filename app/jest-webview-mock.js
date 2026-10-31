const React = require('react');
const { View } = require('react-native');

const WebView = (props) =>
  React.createElement(View, {
    ...props,
    testID: props.testID ?? 'mock-webview',
  });

module.exports = {
  __esModule: true,
  default: WebView,
  WebView,
};
