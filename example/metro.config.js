const path = require('path');
const { getDefaultConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');

const root = path.resolve(__dirname, '..');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
module.exports = (async () => {
  const { withMetroConfig } = await import('react-native-monorepo-config');
  
  const config = withMetroConfig(getDefaultConfig(__dirname), {
    root,
    dirname: __dirname,
  });

  return withNativeWind(config, { input: './global.css' });
})();
