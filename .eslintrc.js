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
  },
  overrides: [
    {
      files: ['src/**/*.ts'],
      parserOptions: {
        project: ['tsconfig.*?.json'],
        createDefaultProgram: true,
      },
      extends: ['plugin:@angular-eslint/recommended'],
      rules: {
        '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'app', style: 'camelCase' }],
        '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'app', style: 'kebab-case' }],
        quotes: ['error', 'single', { allowTemplateLiterals: true }],
      },
    },
  ],
};
