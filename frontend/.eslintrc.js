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
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  ignorePatterns: ['/dist', '*.cy.js', '/cypress/*'],
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
        '@typescript-eslint/no-unused-vars': [
          'warn',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_',
          },
        ],
        quotes: ['error', 'single', { allowTemplateLiterals: true }],
      },
    },
    {
      files: ['*.component.html'],
      parser: '@angular-eslint/template-parser',
      extends: 'plugin:@angular-eslint/template/recommended',
    },
    {
      files: ['*.spec.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
};
