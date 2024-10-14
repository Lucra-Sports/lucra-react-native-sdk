import React from 'react';
import { LucraSDK } from '@lucra-sports/lucra-react-native-sdk';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  View,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Assets } from '../Assets';
import type { RootStackParamList } from '../Routes';
import { ColorOverride } from './ColorOverride';

type Props = NativeStackScreenProps<RootStackParamList, 'Main'>;

export const MainContainer: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1 p-4">
        <Image
          source={Assets.LucraLogo}
          resizeMode="contain"
          className="w-32 h-12"
          // eslint-disable-next-line react-native/no-inline-styles
          style={{ tintColor: 'white' }}
        />
        <View className="mt-4">
          <Text>SDK Navigation</Text>
          <TouchableOpacity
            className="mt-2 bg-darkPurple p-4 rounded-t-xl"
            onPress={() => {
              navigation.navigate('UIFlow');
            }}
          >
            <Text className="text-white">UI Flow Example</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-darkPurple p-4 border-t border-lightPurple rounded-b-xl"
            onPress={() => {
              navigation.navigate('UIComponent');
            }}
          >
            <Text className="text-white">UI Components Example</Text>
          </TouchableOpacity>
        </View>
        <View className="mt-4">
          <Text>Configuration</Text>
          <TouchableOpacity
            className="mt-2 bg-darkPurple p-4 border-t rounded-t-xl border-lightPurple"
            onPress={() => {
              navigation.navigate('APIFlow');
            }}
          >
            <Text className="text-white">API Calls Example</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="mt-2 bg-darkPurple p-4 border-t rounded-t-xl border-lightPurple"
            onPress={() => {
              navigation.navigate('ConfigureUser');
            }}
          >
            <Text className="text-white">Configure User</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-4">
          <Text>COLOR OVERRIDES</Text>
          <ColorOverride />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
