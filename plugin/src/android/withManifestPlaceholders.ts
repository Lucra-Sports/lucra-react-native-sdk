import type { ExpoConfig } from '@expo/config-types';
import { withAppBuildGradle } from '@expo/config-plugins';
import { mergeContents } from '@expo/config-plugins/build/utils/generateCode';
import { appendContents } from '../util/appendContents';

const manifestPlaceholders = `
      manifestPlaceholders = [
          'auth0Domain': 'LUCRA_SDK',
          'auth0Scheme': 'LUCRA_SDK'
      ]`;

export function withManifestPlaceholders(config: ExpoConfig): ExpoConfig {
  return withAppBuildGradle(config, (newConfig) => {
    if (newConfig.modResults.language !== 'groovy') {
      throw new Error(
        'Cannot modify app build gradle because the build.gradle is not groovy'
      );
    }

    newConfig.modResults.contents = appendContents({
      tag: 'lucra-sdk-plugin',
      src: newConfig.modResults.contents,
      newSrc: 'apply plugin: "com.google.firebase.crashlytics"',
      comment: '//',
    }).contents;

    newConfig.modResults.contents = mergeContents({
      tag: 'lucra-sdk-import',
      src: newConfig.modResults.contents,
      newSrc: manifestPlaceholders,
      comment: '//',
      anchor: /versionName.*$/,
      offset: 2,
    }).contents;

    return newConfig;
  });
}
