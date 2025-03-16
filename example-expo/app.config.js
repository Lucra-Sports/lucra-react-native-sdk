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
        CFBundleURLTypes: [
          {
            CFBundleURLSchemes: ['com.lucrasports.mobile-rnsample.venmo'],
            CFBundleURLName: 'Venmo URL Scheme',
          },
        ],
        LSApplicationQueriesSchemes: ['venmo', 'com.venmo.touch.v2'],
      },
    },
    android: {
      package: 'com.lucrasports.mobile.rnsample',
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
        'expo-font',
        {
          fonts: [
            'assets/fonts/RawsonBold.otf',
            'assets/fonts/RawsonRegular.otf',
            'assets/fonts/RawsonSemiBold.otf',
          ],
        },
      ],
      [
        'expo-build-properties',
        {
          ios: {
            deploymentTarget: '15.1',
            networkInspector: false,
          },
          android: {
            minSdkVersion: 24,
            networkInspector: false,
          },
        },
      ],
      // ['@lucra-sports/lucra-react-native-sdk'],
      ['../app.plugin.js'],
    ],
  },
};
