import { LucraSDK } from '@lucra-sports/lucra-react-native-sdk';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { FC } from 'react';
import React from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Assets } from '../Assets';
import type { RootStackParamList } from '../Routes';

type Props = NativeStackScreenProps<RootStackParamList, 'Main'>;

export const MainContainer: FC<Props> = ({ navigation }) => {
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
            navigation.navigate('UIComponent');
          }}
        >
          <Text className="text-white">UI Components Example</Text>
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
          className="bg-darkPurple p-4 border-t border-lightPurple"
          onPress={() => {
            LucraSDK.registerDeepLinkProvider(async () => {
              return 'lucra://flow/profile';
            });
          }}
        >
          <Text className="text-white">Emit Deep Link</Text>
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

            console.log('Updated user', user);
          }}
        >
          <Text className="text-white">Example call configure user</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};
