import {
  type ConfigPlugin,
  AndroidConfig,
  withAndroidManifest,
  withGradleProperties,
} from '@expo/config-plugins';

import { withIosBuildProperties, withIosInfoPlist } from './ios';
import {
  withAndroidBuildProperties,
  withAndroidPermissions,
  withAndroidReceiversAndServices,
  withExtraMavenRepoGradle,
  withManifestPlaceholders,
} from './android';
import type { LucraSDKExpoConfig } from './util/LucraSDKExpoConfig';

const { ensureToolsAvailable } = AndroidConfig.Manifest;

export const withLucraSDKConfig: ConfigPlugin<
  Partial<LucraSDKExpoConfig> | undefined
> = (config, pluginConfig) => {
  // iOS
  config = withIosBuildProperties(config);
  config = withIosInfoPlist(config, pluginConfig);

  // Android
  config = withAndroidBuildProperties(config);
  config = withAndroidManifest(config, (newConfig) => {
    newConfig.modResults = ensureToolsAvailable(newConfig.modResults);
    newConfig.modResults = withAndroidReceiversAndServices(
      newConfig.modResults
    );

    return newConfig;
  });

  config = withAndroidPermissions(config);
  config = withExtraMavenRepoGradle(config);
  config = withManifestPlaceholders(config);

  config = withGradleProperties(config, (newConfig) => {
    const memoryOption = newConfig.modResults.find(
      (item) => item.type === 'property' && item.key === 'org.gradle.jvmargs'
    );

    // TODO: Is there anything we can do about memory consumption?
    if (memoryOption && memoryOption.type === 'property') {
      memoryOption.value = '-Xmx3072m -XX:MaxMetaspaceSize=1024m';
    }

    return newConfig;
  });

  return config;
};

export default withLucraSDKConfig;
