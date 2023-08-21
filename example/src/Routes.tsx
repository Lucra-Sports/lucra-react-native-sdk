import React from 'react';
import type { FC } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainContainer } from './container/Main.container';
import { UIFlowContainer } from './container/UIFlow.container';

export type RootStackParamList = {
  Main: undefined;
  UIFlow: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const Routes: FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: {
          backgroundColor: 'transparent',
        },
      }}
    >
      <Stack.Screen
        name="Main"
        component={MainContainer}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="UIFlow"
        component={UIFlowContainer}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};
