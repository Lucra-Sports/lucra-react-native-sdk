import { LucraSDK } from '@lucra-sports/lucra-react-native-sdk';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { Routes } from './Routes';
import { Platform, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

LucraSDK.init({
  authenticationClientId: 'BHGhy6w9eOPoU7z1UdHffuDNdlihYU6T',
  environment: LucraSDK.ENVIRONMENT.STAGING,
  theme: {
    background: '#6360EB',
    surface: '#001448',
    primary: '#FFFFFF',
    secondary: '#FFFFFF',
    tertiary: '#FFFFFF',
    onBackground: '#FFFFFF',
    onSurface: '#FFFFFF',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onTertiary: '#FFFFFF',
    fontFamily:
      Platform.OS === 'ios'
        ? 'Inter'
        : {
            normal: 'Inter-Regular',
            bold: 'Inter-Bold',
            semibold: 'Inter-SemiBold',
            medium: 'Inter-Medium',
          },
  },
});

export default function App() {
  return (
    <NavigationContainer>
      <LinearGradient colors={['#6360EB', '#001448']} className="h-full">
        <StatusBar barStyle="light-content" />
        <Routes />
      </LinearGradient>
    </NavigationContainer>
  );
}
