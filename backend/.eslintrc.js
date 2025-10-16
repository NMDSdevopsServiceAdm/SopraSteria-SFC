module.exports = {
  env: {
    node: true,
    es6: true,
    mocha: true,
    jasmine: true,
    commonjs: true,
  },
  extends: ['eslint:recommended', 'prettier'],
  rules: {
    quotes: [2, 'single', 'avoid-escape'],
    'no-unused-vars': ['error', { argsIgnorePattern: '^next$' }],
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  ignorePatterns: ['/dist'],
};
