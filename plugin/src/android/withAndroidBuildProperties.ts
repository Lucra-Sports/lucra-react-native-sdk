import { AndroidConfig } from '@expo/config-plugins';

const { createBuildGradlePropsConfigPlugin } = AndroidConfig.BuildProperties;

export const withAndroidBuildProperties = createBuildGradlePropsConfigPlugin(
  [
    {
      propName: 'EX_DEV_CLIENT_NETWORK_INSPECTOR',
      propValueGetter: () => 'false',
    },
  ],
  'withAndroidBuildProperties'
);
