import React from 'react';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { LucraSDK } from '@lucra-sports/lucra-react-native-sdk';

export default function App() {
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
      },
    }).then(() => {
      LucraSDK.present(LucraSDK.FLOW.ADD_FUNDS);
    });
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
