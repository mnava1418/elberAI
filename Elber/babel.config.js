module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ...(process.env.NODE_ENV !== 'test' ? [
      ['module:react-native-dotenv', { moduleName: '@env', path: '.env' }],
    ] : []),
    'react-native-worklets/plugin',
  ],
};
