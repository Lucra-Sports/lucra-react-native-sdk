import {
  type ConfigPlugin,
  withProjectBuildGradle,
} from '@expo/config-plugins';
import { mergeContents } from '@expo/config-plugins/build/utils/generateCode';

export const withExtraMavenRepoGradle: ConfigPlugin = (config) =>
  withProjectBuildGradle(config, (newConfig) => {
    if (newConfig.modResults.language !== 'groovy') {
      throw new Error(
        'Cannot modify maven gradle because the build.gradle is not groovy'
      );
    }

    newConfig.modResults.contents = mergeContents({
      tag: 'lucra-sdk-dependencies',
      src: newConfig.modResults.contents,
      newSrc: `classpath 'com.google.firebase:firebase-crashlytics-gradle:2.9.8'`,
      comment: '//',
      anchor: 'dependencies {',
      offset: 1,
    }).contents;

    return newConfig;
  });
