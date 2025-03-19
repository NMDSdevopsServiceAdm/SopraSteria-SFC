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
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  ignorePatterns: ['/dist'],
  overrides: [
    {
      files: ['*.ts'],
      parserOptions: {
        project: './tsconfig.eslint.json',
      },
      extends: ['plugin:@typescript-eslint/recommended', 'plugin:@angular-eslint/recommended'],
      rules: {
        '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'app', style: 'camelCase' }],
        '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'app', style: 'kebab-case' }],

        quotes: ['error', 'single', { allowTemplateLiterals: true }],
      },
    },
    {
      files: ['*.component.html'],
      parser: '@angular-eslint/template-parser',
      extends: 'plugin:@angular-eslint/template/recommended',
    },
  ],
};
