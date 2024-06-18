import { LucraSDK } from '@lucra-sports/lucra-react-native-sdk';
import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { Routes } from './Routes';
import { Platform, StatusBar, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { PERMISSIONS, request } from 'react-native-permissions';

LucraSDK.addListener('user', (user) => {
  console.log(`✅ Received user callback: ${JSON.stringify(user)}`);
});

export default function App() {
  const [isReady, setIsReady] = React.useState(false);
  useEffect(() => {
    LucraSDK.init({
      apiURL: 'api-sample.sandbox.lucrasports.com',
      apiKey: 'YGugBV5xGsicmp48syEcDlBUQ98YeHE5',
      environment: LucraSDK.ENVIRONMENT.SANDBOX,
      theme: {
        background: '#001448',
        surface: '#1C2575',
        primary: '#09E35F',
        secondary: '#5E5BD0',
        tertiary: '#9C99FC',
        onBackground: '#FFFFFF',
        onSurface: '#FFFFFF',
        onPrimary: '#001448',
        onSecondary: '#FFFFFF',
        onTertiary: '#FFFFFF',
        fontFamily:
          Platform.OS === 'ios'
            ? 'Inter'
            : {
                normal: 'fonts/Inter-Regular.ttf',
                bold: 'fonts/Inter-Bold.ttf',
                semibold: 'fonts/Inter-SemiBold.ttf',
                medium: 'fonts/Inter-Medium.ttf',
              },
      },
    })
      .then(() => {
        setIsReady(true);
      })
      .catch((error) => {
        console.error('Error initializing LucraSDK', error);
      });

    request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
      .then((result) => {
        console.log('Permission result:', result);
      })
      .catch((error) => {
        console.log('Permission error:', error);
      });
  }, []);

  if (!isReady) {
    return <Text>Loading...</Text>;
  }

  return (
    <NavigationContainer>
      <LinearGradient colors={['#6360EB', '#001448']} className="h-full">
        <StatusBar barStyle="light-content" />
        <Routes />
      </LinearGradient>
    </NavigationContainer>
  );
}
