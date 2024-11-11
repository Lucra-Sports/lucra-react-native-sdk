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
            deploymentTarget: '15.1',
          },
        },
      ],
      ['../app.plugin.js'],
    ],
  },
};
