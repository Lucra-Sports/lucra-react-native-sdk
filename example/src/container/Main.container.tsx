import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  View,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Button,
  Alert,
} from 'react-native';
import { Assets } from '../Assets';
import type { RootStackParamList } from '../Routes';
import { ClientOverride } from './ClientOverride';
import { ColorOverride } from './ColorOverride';
import { useAppContext } from '../AppContext';
import { LucraSDK } from '@lucra-sports/lucra-react-native-sdk';

type Props = NativeStackScreenProps<RootStackParamList, 'Main'>;

export const MainContainer: React.FC<Props> = ({ navigation }) => {
  const { state } = useAppContext();
  const [miniGamesMatchupId, setMiniGamesMatchupId] = React.useState('');
  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1" contentContainerClassName="p-4">
        <Image
          source={Assets.LucraLogo}
          resizeMode="contain"
          className="w-32 h-12"
          // eslint-disable-next-line react-native/no-inline-styles
          style={{ tintColor: 'white' }}
        />
        <View className="mt-4 gap-0.5">
          <Text className="text-white">SDK Navigation</Text>
          <TouchableOpacity
            className="mt-2 bg-indigo-700 p-4 rounded-t-xl"
            onPress={() => {
              navigation.navigate('UIFlow');
            }}
          >
            <Text className="text-white">Sheet Flows</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-indigo-700 p-4"
            onPress={() => {
              navigation.navigate('UIEmbeddedPublicFeed');
            }}
          >
            <Text className="text-white">Embedded Public Feed</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-indigo-700 p-4 rounded-b-xl"
            onPress={() => {
              navigation.navigate('UIComponent');
            }}
          >
            <Text className="text-white">Components</Text>
          </TouchableOpacity>
        </View>
        <View className="mt-4 gap-0.5">
          <Text className="text-white">Mini Games</Text>
          <TouchableOpacity
            className="mt-2 bg-indigo-700 p-4 rounded-t-xl"
            onPress={() => {
              navigation.navigate('MiniGameLauncher');
            }}
          >
            <Text className="text-white">Mini Game Launcher</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-indigo-700 p-4"
            onPress={() => {
              LucraSDK.present({ name: LucraSDK.FLOW.MINI_GAMES_HOME });
            }}
          >
            <Text className="text-white">Mini Games Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-indigo-700 p-4"
            onPress={() => {
              LucraSDK.present({ name: LucraSDK.FLOW.MINI_GAMES_PROFILE });
            }}
          >
            <Text className="text-white">Mini Games Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-indigo-700 p-4"
            onPress={() => {
              LucraSDK.present({ name: LucraSDK.FLOW.MINI_GAMES_REWARDS });
            }}
          >
            <Text className="text-white">Mini Games Rewards</Text>
          </TouchableOpacity>
          <TextInput
            className="bg-indigo-900 text-white p-4"
            placeholder="Matchup ID (for Matchup Details)"
            placeholderTextColor="#a5b4fc"
            autoCapitalize="none"
            autoCorrect={false}
            value={miniGamesMatchupId}
            onChangeText={setMiniGamesMatchupId}
          />
          <TouchableOpacity
            className="bg-indigo-700 p-4"
            onPress={() => {
              const id = miniGamesMatchupId.trim();
              if (!id) {
                Alert.alert(
                  'Matchup ID required',
                  'Enter a matchup ID above first.'
                );
                return;
              }
              LucraSDK.present({
                name: LucraSDK.FLOW.MINI_GAMES_MATCHUP_DETAILS,
                matchupId: id,
              });
            }}
          >
            <Text className="text-white">Mini Games Matchup Details</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-indigo-700 p-4 rounded-b-xl"
            onPress={() => {
              navigation.navigate('RewardsAchievements');
            }}
          >
            <Text className="text-white">Rewards & Achievements</Text>
          </TouchableOpacity>
        </View>
        <View className="mt-4 gap-0.5">
          <Text className="text-white">Configuration</Text>
          <TouchableOpacity
            className="mt-2 bg-indigo-700 p-4 rounded-t-xl "
            onPress={() => {
              navigation.navigate('APIFlow');
            }}
          >
            <Text className="text-white">API Calls Example</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-indigo-700 p-4 "
            onPress={() => {
              navigation.navigate('ConfigureUser');
            }}
          >
            <Text className="text-white">Configure User</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-indigo-700 p-4"
            onPress={() => {
              navigation.navigate('EventViewer');
            }}
          >
            <Text className="text-white">Event Viewer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-indigo-700 p-4 rounded-b-xl"
            onPress={() => {
              navigation.navigate('PushDeeplinkTester');
            }}
          >
            <Text className="text-white">Push / Deeplink Tester</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-4">
          <Text className="text-white">Lucra SDK Client Parameters</Text>
          <ClientOverride />
        </View>

        <View className="mt-4">
          <Text className="text-white">Color Overrides</Text>
          <ColorOverride />
        </View>
      </ScrollView>
      <View>
        {state.dirty && (
          <Button
            title="Restart required"
            onPress={() => {
              Alert.alert(
                'Restart required',
                'Close and re open the app for config changes to take place'
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};
