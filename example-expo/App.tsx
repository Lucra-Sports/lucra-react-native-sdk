import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { LucraSDK } from '@lucra-sports/lucra-react-native-sdk';
import { nullthrows } from './nullthrows';
import * as Linking from 'expo-linking';


let apiKey = process.env.EXPO_PUBLIC_LUCRASDK_API_KEY!;

nullthrows(apiKey, 'Missing API Key');
export default function App() {
  LucraSDK.init({
    apiKey: apiKey,
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
          ? 'Rawson'
          : {
              normal: 'fonts/RawsonRegular.otf',
              bold: 'fonts/RawsonBold.otf',
              semibold: 'fonts/RawsonSemiBold.otf',
              medium: 'fonts/RawsonRegular.otf',
            },
    },
  }).then(() => {
    console.warn('LucraSDK initialized');
    LucraSDK.present({ name: LucraSDK.FLOW.ADD_FUNDS });
  });
  useEffect(() => {
    console.warn(apiKey);
  }, []);

  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      console.log('url from listener', url);
    });
    const getInitialLink = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        console.log('Initial url is: ', initialUrl);
      }
    };
    getInitialLink();
    return () => subscription.remove();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Simple test of LucraSDK build using expo</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
