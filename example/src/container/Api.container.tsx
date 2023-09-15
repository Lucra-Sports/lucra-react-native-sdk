import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { FC } from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Assets } from '../Assets';
import type { RootStackParamList } from '../Routes';
import {
  LucraSDK,
  type LucraSDKError,
} from '@lucra-sports/lucra-react-native-sdk';

type Props = NativeStackScreenProps<RootStackParamList, 'APIFlow'>;

let currentMatchupId: string;

function handleLucraSDKError(e: LucraSDKError) {
  switch (e.code) {
    case 'notInitialized':
      console.warn('SDK not initialized', e);
      LucraSDK.present(LucraSDK.FLOW.ONBOARDING);
      break;

    case 'unverified':
      console.warn('User not verified', e);
      LucraSDK.present(LucraSDK.FLOW.VERIFY_IDENTITY);
      break;

    case 'notAllowed':
      console.warn('User not allowed', e);
      break;

    case 'insufficientFunds':
      console.warn('Insufficient funds', e);
      LucraSDK.present(LucraSDK.FLOW.ADD_FUNDS);
      break;

    case 'unknown':
      console.warn('Unknown error', e);
      break;

    default:
      break;
  }
}

export const ApiContainer: FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView className="flex-1">
      <View className="pt-4 px-4 flex-1 g-2 bg-transparent">
        <View className="flex-row items-center g-2">
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}
          >
            <Image
              source={Assets.ChevronLeft}
              style={Styles.chevron}
              className="h-8 w-8"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className="w-full border border-lightPurple p-4 items-center justify-center rounded-lg"
          onPress={() => {
            LucraSDK.createGamesMatchup('DARTS', 1.0)
              .then((res) => {
                currentMatchupId = res.matchupId;
                console.warn('Created game match up', res);
              })
              .catch(handleLucraSDKError);
          }}
        >
          <Text className="font-bold text-white">Start Matchup</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full border border-lightPurple p-4 items-center justify-center rounded-lg"
          onPress={() => {
            LucraSDK.acceptGamesMatchup('INSERT_ID_HERE', 'TEAM_ID').catch(
              handleLucraSDKError
            );
          }}
        >
          <Text className="font-bold text-white">Accept match up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full border border-lightPurple p-4 items-center justify-center rounded-lg"
          onPress={() => {
            LucraSDK.cancelGamesMatchup(currentMatchupId)
              .then(() => {
                console.warn('Cancelled game match up');
              })
              .catch(handleLucraSDKError);
          }}
        >
          <Text className="font-bold text-white">Cancel Matchup</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const Styles = StyleSheet.create({
  chevron: {
    tintColor: 'white',
  },
});
