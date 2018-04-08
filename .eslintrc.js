// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
  },
  // https://github.com/standard/standard/blob/master/docs/RULES-en.md
  extends: 'standard',
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  // add your custom rules here
  rules: {
    // allow async-await
    'generator-star-spacing': 'off',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'semi': [2, 'always'],
    'spaced-comment': 0,
    'no-new': 0,
    'indent': 0,
    'no-tabs': 0,
    "comma-dangle": 0,
    "no-trailing-spaces": 0,
    "eol-last": 0,
    'comma-spacing': 0,
    'space-before-function-paren': 0,
    'one-var': 0,
    "key-spacing": 0,
    'no-multiple-empty-lines': 0,
    'no-useless-return': 0
  }
}