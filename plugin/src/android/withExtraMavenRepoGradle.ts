import {
  type ConfigPlugin,
  withProjectBuildGradle,
} from '@expo/config-plugins';
import { mergeContents } from '@expo/config-plugins/build/utils/generateCode';
import { appendContents } from '../util/appendContents';

const gradleMaven = `
  allprojects {
    repositories {
      maven {
        name = "LucraGithubPackages"
        url = uri("https://maven.pkg.github.com/Lucra-Sports/lucra-android-sdk")
        credentials {
          String gprUser = findProperty('GPR_USER') ?: System.getenv('GPR_USER')
          String gprKey = findProperty('GPR_KEY') ?: System.getenv('GPR_KEY')
          username = gprUser
          password = gprKey
        }
      }
      maven {
        url "https://zendesk.jfrog.io/zendesk/repo"
      }
    }
  }
  `;

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

    newConfig.modResults.contents = appendContents({
      tag: 'lucra-sdk-repository',
      src: newConfig.modResults.contents,
      newSrc: gradleMaven,
      comment: '//',
    }).contents;

    return newConfig;
  });
