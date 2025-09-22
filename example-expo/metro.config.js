const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');

const config = getDefaultConfig(__dirname);
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

config.resolver.blockList = exclusionList([
  // Block the workspace root's node_modules to prevent conflicts
  new RegExp(`${workspaceRoot}/node_modules/.*`),
  // Block other example directories
  new RegExp(`${workspaceRoot}/example/.*`),
]);

// Point to the built module output
config.resolver.alias = {
  '@lucra-sports/lucra-react-native-sdk': path.resolve(workspaceRoot, 'src'),
};
// Watch the source files in the workspace
config.watchFolders = [workspaceRoot];

module.exports = config;
