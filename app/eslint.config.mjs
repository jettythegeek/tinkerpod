import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      '.expo/**',
      'dist/**',
      'web-build/**',
      'coverage/**',
      'tailwind.config.js',
      'babel.config.js',
      'metro.config.js',
      'metro-svg-transformer.js',
      'jest.config.js',
      'jest-svg-transformer.js',
      'jest-lucide-mock.js',
      'jest-webview-mock.js',
      'nativewind-env.d.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },
);
