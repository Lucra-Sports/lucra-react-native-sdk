import '../global.css';
import { LucraSDK } from '@lucra-sports/lucra-react-native-sdk';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { Routes } from './Routes';
import { StatusBar, Text, View } from 'react-native';
import { AppContextProvider } from './AppContext';
import LucraSDKInit from './LucraSDKInit';
import { EventsContextProvider } from './EventsContext';

LucraSDK.addListener('user', (user) => {
  console.log(`✅ Received user callback: ${JSON.stringify(user)}`);
});

export default function App() {
  const [isReady, setIsReady] = React.useState(false);
  return (
    <View className="h-full bg-indigo-900">
      <View className="p-4 bg-white rounded-t-xl mt-12" />
      <AppContextProvider>
        <EventsContextProvider>
          <LucraSDKInit onStateChange={setIsReady} />
          <StatusBar barStyle="light-content" />
          {!isReady ? (
            <View className="flex-1 items-center justify-center">
              <Text className="text-white">Loading...</Text>
            </View>
          ) : (
            <NavigationContainer>
              <Routes />
            </NavigationContainer>
          )}
        </EventsContextProvider>
      </AppContextProvider>
    </View>
  );
}
