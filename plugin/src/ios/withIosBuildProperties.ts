import { IOSConfig } from '@expo/config-plugins';

const { createBuildPodfilePropsConfigPlugin } = IOSConfig.BuildProperties;

export const withIosBuildProperties = createBuildPodfilePropsConfigPlugin(
  [
    {
      propName: 'ios.useFrameworks',
      propValueGetter: () => 'static',
    },
    {
      propName: 'EX_DEV_CLIENT_NETWORK_INSPECTOR',
      propValueGetter: () => 'false',
    },
  ],
  'withIosBuildProperties'
);
