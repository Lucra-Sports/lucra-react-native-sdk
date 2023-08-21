import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { FC } from 'react';
import React from 'react';
import { Image, SafeAreaView, Text, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Assets } from '../Assets';
import type { RootStackParamList } from '../Routes';

type Props = NativeStackScreenProps<RootStackParamList, 'Main'>;

export const MainContainer: FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView className="flex-1">
      <LinearGradient colors={['#6360EB', '#001448']} className="flex-1 p-4">
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
          className="bg-darkPurple p-4 rounded-b-xl border-t border-lightPurple"
          disabled
        >
          <Text className="text-white">API Calls Example</Text>
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
};
