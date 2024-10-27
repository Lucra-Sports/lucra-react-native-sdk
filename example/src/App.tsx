import '../global.css';
import { LucraSDK } from '@lucra-sports/lucra-react-native-sdk';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { Routes } from './Routes';
import { StatusBar, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { AppContextProvider } from './AppContext';
import LucraSDKInit from './LucraSDKInit';
import { EventsContextProvider } from './EventsContext';

LucraSDK.addListener('user', (user) => {
  console.log(`✅ Received user callback: ${JSON.stringify(user)}`);
});

export default function App() {
  const [isReady, setIsReady] = React.useState(false);
  console.log('Is ready:', isReady);
  return (
    <AppContextProvider>
      <EventsContextProvider>
        <Text>Init</Text>
        <LucraSDKInit onStateChange={setIsReady} />
        {!isReady ? (
          <LinearGradient colors={['#6360EB', '#001448']} className="h-full">
            <View className="flex-1 items-center justify-center">
              <Text className="text-white">Loading...</Text>
            </View>
          </LinearGradient>
        ) : (
          <NavigationContainer>
            <LinearGradient colors={['#6360EB', '#001448']} className="h-full">
              <StatusBar barStyle="light-content" />
              <Routes />
            </LinearGradient>
          </NavigationContainer>
        )}
      </EventsContextProvider>
    </AppContextProvider>
  );
}
