module.exports = {
  extends: 'eslint:recommended',
  parserOptions: {
    sourceType: 'module',
    modules: true,
    ecmaVersion: 'latest',
  },
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
  },
};
