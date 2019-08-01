module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['plugin:@typescript-eslint/recommended', 'plugin:react/recommended', 'react-app'],
  plugins: ['@typescript-eslint', 'react'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    '@typescript-eslint/indent': ['warn', 2],
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/class-name-casing': 'warn', // withTheme, etc
    '@typescript-eslint/explicit-function-return-type': 'off', // just infer it...
    'react/prop-types': 'off', // use TS
    '@typescript-eslint/member-delimiter-style': 'off',
    'jsx-a11y/alt-text': 'off',
  },
}
