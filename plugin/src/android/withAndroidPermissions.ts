import { type ConfigPlugin, AndroidConfig } from '@expo/config-plugins';

const { withPermissions } = AndroidConfig.Permissions;

export const withAndroidPermissions: ConfigPlugin = (config) =>
  withPermissions(config, [
    'android.permission.ACCESS_NETWORK_STATE',
    'android.permission.WAKE_LOCK',
    'android.permission.ACCESS_COARSE_LOCATION',
    'android.permission.ACCESS_FINE_LOCATION',
    'com.google.android.gms.permission.AD_ID',
    'android.webkit.PermissionRequest',
    'com.google.android.providers.gsf.permission.READ_GSERVICES',
    'android.permission.READ_PHONE_STATE',
    'android.permission.USE_BIOMETRIC',
  ]);
