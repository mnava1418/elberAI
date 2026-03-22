module.exports = {
  preset: 'react-native',
  coverageProvider: 'v8',
  moduleNameMapper: {
    '^@env$': '<rootDir>/src/__tests__/__mocks__/env.ts',
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__mocks__/',
  ],
  setupFiles: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|react-native-.*|@react-native|@react-native-.*|@react-navigation|@react-navigation/.*)/)',
  ],
};
