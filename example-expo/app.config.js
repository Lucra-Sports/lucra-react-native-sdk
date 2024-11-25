export default {
  expo: {
    name: 'lucra-rn-expo',
    slug: 'lucra-rn-expo',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.lucrasports.mobile-rnsample',
      infoPlist: {
        NSBluetoothAlwaysUsageDescription:
          'Our application needs Bluetooth access to determine whether you are in an eligible area to use this feature. Location checks are only performed when using this feature.',
        NSBluetoothPeripheralUsageDescription:
          'Our application needs Bluetooth access to determine whether you are in an eligible area to use this feature. Location checks are only performed when using this feature.',
        NSFaceIDUsageDescription: 'We use FaceID to improve security.',
        NSLocationAlwaysAndWhenInUseUsageDescription:
          'We need your location to verify you are in a legal state to make deposits and create or accept contests.',
        NSLocationAlwaysUsageDescription:
          'We need your location to verify you are in a legal state to make deposits and create or accept contests.',
        NSLocationWhenInUseUsageDescription:
          'We need your location to verify you are in a legal state to make deposits and create or accept contests.',
        NSMotionUsageDescription:
          'Our application needs motion information to determine if you are eligible to use this feature. Motion information is only collected when using this feature.',
        NSPhotoLibraryUsageDescription: 'Needed to add a profile avatar image.',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      [
        'expo-build-properties',
        {
          ios: {
            deploymentTarget: '15.0',
            useFrameworks: 'static',
            networkInspector: false,
          },
          android: {
            networkInspector: false,
          },
        },
      ],
    ],
  },
};
