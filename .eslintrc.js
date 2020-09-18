module.exports = {
  extends: ['plugin:@angular-eslint/recommended', 'prettier'],
  rules: {
    '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'app', style: 'camelCase' }],
    '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'app', style: 'kebab-case' }],
    quotes: [2, 'single', 'avoid-escape'],
  },
};
