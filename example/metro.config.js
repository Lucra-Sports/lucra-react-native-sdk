const path = require('path');
const { getDefaultConfig } = require('@react-native/metro-config');
const { withMetroConfig } = require('react-native-monorepo-config');
const { withNativeWind } = require('nativewind/metro');
// const {
//   wrapWithReanimatedMetroConfig,
// } = require('react-native-reanimated/metro-config');

const root = path.resolve(__dirname, '..');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = withMetroConfig(getDefaultConfig(__dirname), {
  root,
  dirname: __dirname,
});

// const configWithReanimated = wrapWithReanimatedMetroConfig(config)

module.exports = withNativeWind(config, { input: './global.css' })
