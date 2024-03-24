import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { FC } from 'react';
import React from 'react';
import {
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Assets } from '../Assets';
import type { RootStackParamList } from '../Routes';
import { LucraFlow, LucraSDK } from '@lucra-sports/lucra-react-native-sdk';

type Props = NativeStackScreenProps<RootStackParamList, 'Main'>;

export const MainContainer: FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 p-4">
        <Image
          source={Assets.LucraLogo}
          resizeMode="contain"
          className="w-32 h-12"
          // eslint-disable-next-line react-native/no-inline-styles
          style={{ tintColor: 'white' }}
        />
        <TouchableOpacity
          className="mt-4 bg-darkPurple p-4 rounded-t-xl"
          onPress={() => {
            navigation.navigate('UIFlow');
          }}
        >
          <Text className="text-white">UI Flow Example</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-darkPurple p-4 border-t border-lightPurple"
          onPress={() => {
            navigation.navigate('APIFlow');
          }}
        >
          <Text className="text-white">API Calls Example</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-darkPurple p-4 rounded-b-xl border-t border-lightPurple"
          onPress={async () => {
            await LucraSDK.configureUser({
              firstName: 'blah',
              address: {
                address: 'quack',
              },
            });

            let user = await LucraSDK.getUser();

            console.warn(user);
          }}
        >
          <Text className="text-white">Example call configure user</Text>
        </TouchableOpacity>
        <Text className="text-white my-2"> Example embedded view</Text>
        <LucraFlow name={LucraSDK.FLOW.PROFILE} className="flex-1 bg-white" />
      </View>
    </SafeAreaView>
  );
};
