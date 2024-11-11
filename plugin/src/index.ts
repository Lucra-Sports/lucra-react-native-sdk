import { type ConfigPlugin } from '@expo/config-plugins';

import { withIosBuildProperties, withIosInfoPlist } from './ios';
import type { LucraSDKExpoConfig } from './util/LucraSDKExpoConfig';

export const withLucraSDKConfig: ConfigPlugin<
  Partial<LucraSDKExpoConfig> | undefined
> = (config, pluginConfig) => {
  // iOS
  config = withIosBuildProperties(config);
  config = withIosInfoPlist(config, pluginConfig);

  return config;
};

export default withLucraSDKConfig;
