const fs = require('fs');
const path = require('path');
const { getConfig } = require('react-native-builder-bob/babel-config');
const pkg = require('../package.json');

const root = path.resolve(__dirname, '..');
const envFilePath = path.resolve(__dirname, '.env');
const lucraEnvKeys = ['LUCRA_SDK_API_KEY'];

const parseEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  return fs
    .readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .reduce((acc, line) => {
      const trimmedLine = line.trim();

      if (!trimmedLine || trimmedLine.startsWith('#')) {
        return acc;
      }

      const match = trimmedLine.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (!match) {
        return acc;
      }

      const [, key, rawValue] = match;
      let value = rawValue.trim();

      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      return { ...acc, [key]: value };
    }, {});
};

const envFromFile = parseEnvFile(envFilePath);
const lucraEnvValues = {};

lucraEnvKeys.forEach((key) => {
  const value = process.env[key] ?? envFromFile[key] ?? '';

  if (!(key in process.env) && value) {
    process.env[key] = value;
  }

  lucraEnvValues[key] = value;
});

if (!lucraEnvValues.LUCRA_SDK_API_KEY) {
  throw new Error(
    'Missing LUCRA_SDK_API_KEY. Provide it via example/.env or GitHub secrets.'
  );
}

module.exports = getConfig(
  {
    presets: ['module:@react-native/babel-preset', 'nativewind/babel'],
    plugins: [
      'babel-plugin-transform-typescript-metadata',
      [
        path.resolve(__dirname, 'babel-plugins/inline-lucra-env'),
        { values: lucraEnvValues },
      ],
      'react-native-reanimated/plugin',
    ],
  },
  { root, pkg }
);
