import type { ExpoConfig } from '@expo/config-types';
import { withAppBuildGradle } from '@expo/config-plugins';
import { mergeContents } from '@expo/config-plugins/build/utils/generateCode';
import { appendContents } from '../util/appendContents';

const desugaringConfig = `
        compileOptions {
            sourceCompatibility JavaVersion.VERSION_1_8
            targetCompatibility JavaVersion.VERSION_1_8
            coreLibraryDesugaringEnabled true
        }`;

const desugaringDependency = `    coreLibraryDesugaring 'com.android.tools:desugar_jdk_libs:2.0.4'`;

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
      anchor: /^\s*versionName\s+["'].*?["']\s*$/,
      offset: 1,
    }).contents;

    // Add desugaring configuration in android block
    newConfig.modResults.contents = mergeContents({
      tag: 'lucra-sdk-desugaring',
      src: newConfig.modResults.contents,
      newSrc: desugaringConfig,
      comment: '//',
      anchor: /android\s*{/,
      offset: 1,
    }).contents;

    // Add desugaring dependency
    newConfig.modResults.contents = mergeContents({
      tag: 'lucra-sdk-desugaring-dep',
      src: newConfig.modResults.contents,
      newSrc: desugaringDependency,
      comment: '//',
      anchor: /dependencies\s*{/,
      offset: 1,
    }).contents;

    return newConfig;
  });
}
