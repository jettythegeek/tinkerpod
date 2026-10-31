/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'svg'],
  moduleNameMapper: {
    '^lucide-react-native$': '<rootDir>/jest-lucide-mock.js',
    '^react-native-webview$': '<rootDir>/jest-webview-mock.js',
  },
  transform: {
    '^.+\\.svg$': '<rootDir>/jest-svg-transformer.js',
    '^.+\\.(ogg|wav)$': '<rootDir>/jest-svg-transformer.js',
  },
  testTimeout: 30000,
};
