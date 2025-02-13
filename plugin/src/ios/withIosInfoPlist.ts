import { type ConfigPlugin, withInfoPlist } from '@expo/config-plugins';
import type { LucraSDKExpoConfig } from '../util/LucraSDKExpoConfig';

const PERMISSIONS_CONFIG = [
  'NSBluetoothAlwaysUsageDescription',
  'NSBluetoothPeripheralUsageDescription',
  'NSFaceIDUsageDescription',
  'NSLocationAlwaysAndWhenInUseUsageDescription',
  'NSLocationAlwaysUsageDescription',
  'NSLocationWhenInUseUsageDescription',
  'NSMotionUsageDescription',
  'NSCameraUsageDescription',
  'NSPhotoLibraryUsageDescription',
] as const;
const BLUETOOTH_CONFIG = {
  key: 'bluetoothPermission' as const,
  defaultUsage:
    'Allow $(PRODUCT_NAME) Bluetooth access to determine whether you are in an eligible area to use this feature. Location checks are only performed when using this feature.',
};
const LOCATION_CONFIG = {
  key: 'locationPermission' as const,
  defaultUsage:
    'Allow $(PRODUCT_NAME) to know location to verify you are in a legal state to make deposits and create or accept contests.',
};
const PERMISSIONS_CONFIG_MAP: Record<
  (typeof PERMISSIONS_CONFIG)[number],
  { key: keyof LucraSDKExpoConfig; defaultUsage: string }
> = {
  NSBluetoothAlwaysUsageDescription: BLUETOOTH_CONFIG,
  // FIXME: Deprecated
  NSBluetoothPeripheralUsageDescription: BLUETOOTH_CONFIG,
  NSFaceIDUsageDescription: {
    key: 'faceIDPermission',
    defaultUsage: 'Allow $(PRODUCT_NAME) to use FaceID to improve security.',
  },
  NSLocationAlwaysAndWhenInUseUsageDescription: LOCATION_CONFIG,
  // FIXME: Deprecated
  NSLocationAlwaysUsageDescription: LOCATION_CONFIG,
  NSLocationWhenInUseUsageDescription: LOCATION_CONFIG,
  NSMotionUsageDescription: {
    key: 'motionPermission',
    defaultUsage:
      'Allow $(PRODUCT_NAME) to use motion information to determine if you are eligible to use this feature. Motion information is only collected when using this feature.',
  },
  NSCameraUsageDescription: {
    key: 'cameraPermission',
    defaultUsage: 'Needed to add a profile avatar image.',
  },
  NSPhotoLibraryUsageDescription: {
    key: 'photoLibraryPermission',
    defaultUsage: 'Needed to add a profile avatar image.',
  },
};

export const withIosInfoPlist: ConfigPlugin<
  Partial<LucraSDKExpoConfig> | undefined
> = (config, pluginConfig) =>
  withInfoPlist(config, (newConfig) => {
    PERMISSIONS_CONFIG.forEach((permission) => {
      const { key, defaultUsage } = PERMISSIONS_CONFIG_MAP[permission];

      newConfig.modResults[permission] =
        !!pluginConfig && key in pluginConfig
          ? pluginConfig[key]
          : newConfig.modResults[permission] || defaultUsage;
    });

    return newConfig;
  });
