const globals = require('globals');
const haensl = require('@haensl/eslint-config');

module.exports = [
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest
      }
    }
  },
  ...haensl
];
