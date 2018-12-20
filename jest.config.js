const { defaults } = require('jest-config');
module.exports = {
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts', 'tsx'],
  transform: { '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest' },
  testMatch: ['**/?(*.)(spec|test|e2e).(j|t)s?(x)'],
  collectCoverage: true,
  globals: {
    'ts-jest': {
      useBabelrc: true
    }
  }
};
