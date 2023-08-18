import { LucraSDK } from '@lucra-sports/lucra-react-native-sdk';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { Routes } from './Routes';

LucraSDK.init('BHGhy6w9eOPoU7z1UdHffuDNdlihYU6T', LucraSDK.ENVIRONMENT.STAGING);

export default function App() {
  return (
    <NavigationContainer>
      <Routes />
    </NavigationContainer>
  );
}
