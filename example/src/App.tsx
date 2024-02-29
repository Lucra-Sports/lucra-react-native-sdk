import { LucraSDK } from '@lucra-sports/lucra-react-native-sdk';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { Routes } from './Routes';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Platform, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

LucraSDK.init({
  // authenticationClientId: 'YGugBV5xGsicmp48syEcDlBUQ98YeHE5',
  apiURL: 'https://api.sandbox.lucra.com',
  apiKey: 'YGugBV5xGsicmp48syEcDlBUQ98YeHE5',
  environment: LucraSDK.ENVIRONMENT.SANDBOX,
  // theme: {
  //   background: '#001448',
  //   surface: '#1C2575',
  //   primary: '#09E35F',
  //   secondary: '#5E5BD0',
  //   tertiary: '#9C99FC',
  //   onBackground: '#FFFFFF',
  //   onSurface: '#FFFFFF',
  //   onPrimary: '#001448',
  //   onSecondary: '#FFFFFF',
  //   onTertiary: '#FFFFFF',
  //   fontFamily:
  //     Platform.OS === 'ios'
  //       ? 'Inter'
  //       : {
  //           normal: 'Inter-Regular',
  //           bold: 'Inter-Bold',
  //           semibold: 'Inter-SemiBold',
  //           medium: 'Inter-Medium',
  //         },
  // },
});

// LucraSDK.registerUserCallback((user) => {
//   // console.log(`User callback called ${JSON.stringify(user, null, 2)}`);
//   console.log(`✅ recevied user callback with id: ${user.id}`);
// });

// setTimeout(() => {
//   console.log('configuring user');
//   LucraSDK.configurateUser({
//     firstName: 'blah',
//     address: {
//       address: 'quack',
//     },
//   });
// }, 400);

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
