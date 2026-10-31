const React = require('react');
const { View } = require('react-native');

module.exports = new Proxy(
  {},
  {
    get(_target, prop) {
      if (prop === '__esModule') {
        return true;
      }
      const IconMock = (props) =>
        React.createElement(View, {
          ...props,
          accessibilityRole: 'image',
          testID: props.testID ?? `lucide-${String(prop)}`,
        });
      IconMock.displayName = `Lucide${String(prop)}`;
      return IconMock;
    },
  },
);
