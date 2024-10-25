import { LucraSDK } from '@lucra-sports/lucra-react-native-sdk';
import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { Routes } from './Routes';
import { Platform, StatusBar, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { AppContextProvider } from './AppContext';
import LucraSDKInit from './LucraSDKInit';
import { EventsContextProvider } from './EventsContext';
import { PERMISSIONS, request } from 'react-native-permissions';
import { DeepLinkManager } from './DeepLinkManager';

LucraSDK.addListener('user', (user) => {
  console.log(`✅ Received user callback: ${JSON.stringify(user)}`);
});

export default function App() {
  const [isReady, setIsReady] = React.useState(false);

  useEffect(() => {
    // Lucra requires location permissions for compliance when creating a new match or game, so Android location permissions are requested as early as possible.
    if (Platform.OS === 'android') {
      request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
        .then((result) => {
          console.log('Permission result:', result);
        })
        .catch((error) => {
          console.log('Permission error:', error);
        });
    }
  }, []);

  return (
    <AppContextProvider>
      <EventsContextProvider>
        <LucraSDKInit onStateChange={setIsReady} />
        {!isReady ? (
          <Text>Loading...</Text>
        ) : (
          <>
            <DeepLinkManager />
            <NavigationContainer>
              <LinearGradient
                colors={['#6360EB', '#001448']}
                className="h-full"
              >
                <StatusBar barStyle="light-content" />
                <Routes />
              </LinearGradient>
            </NavigationContainer>
          </>
        )}
      </EventsContextProvider>
    </AppContextProvider>
  );
}
