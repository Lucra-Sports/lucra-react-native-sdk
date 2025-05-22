import type { FC } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainContainer } from './container/Main.container';
import { UIFlowContainer } from './container/UIFlow.container';
import { UIComponentContainer } from './container/UIComponent.container';
import { ApiContainer } from './container/Api.container';
import { ConfigureUser } from './container/ConfigureUser';
import { UIEmbeddedPublicFeed } from './container/UIEmbeddedPublicFeed';
import { EventViewer } from './container/EventViewer';
import { SportsYouWatch } from './container/APIExample/SportsYouWatch';
import { GamesYouPlay } from './container/APIExample/GamesYouPlay';

export type RootStackParamList = {
  Main: undefined;
  UIFlow: undefined;
  APIFlow: undefined;
  UIComponent: undefined;
  UIEmbeddedPublicFeed: undefined;
  ConfigureUser: undefined;
  EventViewer: undefined;
  SportsYouWatch: undefined;
  GamesYouPlay: undefined;
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
        name="UIEmbeddedPublicFeed"
        component={UIEmbeddedPublicFeed}
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
      <Stack.Screen
        name="EventViewer"
        component={EventViewer}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ConfigureUser"
        component={ConfigureUser}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="SportsYouWatch"
        component={SportsYouWatch}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="GamesYouPlay"
        component={GamesYouPlay}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};
