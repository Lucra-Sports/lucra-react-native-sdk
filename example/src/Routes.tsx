import React from 'react';
import type { FC } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainContainer } from './container/Main.container';
import { UIFlowContainer } from './container/UIFlow.container';
import { UIComponentContainer } from './container/UIComponent.container';
import { ApiContainer } from './container/Api.container';
import ConfigureUser from './container/ConfigureUser';

export type RootStackParamList = {
  Main: undefined;
  UIFlow: undefined;
  APIFlow: undefined;
  UIComponent: undefined;
  ConfigureUser: undefined;
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
      <Stack.Screen
        name="UIComponent"
        component={UIComponentContainer}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="APIFlow"
        component={ApiContainer}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name="ConfigureUser" component={ConfigureUser} />
    </Stack.Navigator>
  );
};
