import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  View,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  Button,
  BackHandler,
  Platform,
  Alert,
} from 'react-native';
import { Assets } from '../Assets';
import type { RootStackParamList } from '../Routes';
import { ClientOverride } from './ClientOverride';
import { ColorOverride } from './ColorOverride';
import { useAppContext } from '../AppContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Main'>;

export const MainContainer: React.FC<Props> = ({ navigation }) => {
  const { state } = useAppContext();
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
          <Text>CONFIGURATION</Text>
          <TouchableOpacity
            className="mt-2 bg-darkPurple p-4 border-t rounded-t-xl border-lightPurple"
            onPress={() => {
              navigation.navigate('APIFlow');
            }}
          >
            <Text className="text-white">API Calls Example</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-darkPurple p-4 border-t border-lightPurple"
            onPress={() => {
              navigation.navigate('ConfigureUser');
            }}
          >
            <Text className="text-white">Configure User</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-4">
          <Text>CLIENT OVERRIDES</Text>
          <ClientOverride />
        </View>

        <View className="mt-4">
          <Text>COLOR OVERRIDES</Text>
          <ColorOverride />
        </View>
      </ScrollView>
      <View>
        {state.dirty && (
          <Button
            title="Restart required"
            onPress={() => {
              if (Platform.OS === 'android') {
                return BackHandler.exitApp();
              }
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
