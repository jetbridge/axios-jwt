module.exports = {
  extends: ['plugin:@typescript-eslint/recommended'],
  plugins: ['@typescript-eslint'],
  overrides: [
    {
      files: ['*.test.ts'],
      rules: {
        '@typescript-eslint/no-var-requires': 0,
        '@typescript-eslint/no-explicit-any': 0,
      },
    },
  ],
}
