import '../global.css';
import { LucraSDK } from '@lucra-sports/lucra-react-native-sdk';
import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { Routes } from './Routes';
import { Platform, SafeAreaView, StatusBar, Text, View } from 'react-native';
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
    <SafeAreaView className="flex-1 bg-indigo-900 pt-8">
      <View className="flex-1 px-4 pt-4 pb-8">
        <AppContextProvider>
          <EventsContextProvider>
            <LucraSDKInit onStateChange={setIsReady} />
            <StatusBar barStyle="light-content" />
            {!isReady ? (
              <View className="flex-1 items-center justify-center">
                <Text className="text-white">Loading...</Text>
              </View>
            ) : (
              <>
                <DeepLinkManager />
                <NavigationContainer>
                  <StatusBar barStyle="light-content" />
                  <Routes />
                </NavigationContainer>
              </>
            )}
          </EventsContextProvider>
        </AppContextProvider>
      </View>
    </SafeAreaView>
  );
}
