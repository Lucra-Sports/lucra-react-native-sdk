import { LucraSDK } from '@lucra-sports/lucra-react-native-sdk';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { Routes } from './Routes';
import { StatusBar, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { AppContextProvider } from './AppContext';
import LucraSDKInit from './LucraSDKInit';

LucraSDK.addListener('user', (user) => {
  console.log(`✅ Received user callback: ${JSON.stringify(user)}`);
});

export default function App() {
  const [isReady, setIsReady] = React.useState(false);

  return (
    <AppContextProvider>
      <LucraSDKInit onStateChange={setIsReady} />
      {!isReady ? (
        <Text>Loading...</Text>
      ) : (
        <NavigationContainer>
          <LinearGradient colors={['#6360EB', '#001448']} className="h-full">
            <StatusBar barStyle="light-content" />
            <Routes />
          </LinearGradient>
        </NavigationContainer>
      )}
    </AppContextProvider>
  );
}
