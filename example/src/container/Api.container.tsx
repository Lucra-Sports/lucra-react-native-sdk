import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { FC } from 'react';
import React from 'react';
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
import { LucraSDK } from '@lucra-sports/lucra-react-native-sdk';

type Props = NativeStackScreenProps<RootStackParamList, 'APIFlow'>;

let currentMatchupId: string;

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
              .catch((e) => {
                console.warn('Could not create game match up', e);
              });
          }}
        >
          <Text className="font-bold text-white">Start Matchup</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full border border-lightPurple p-4 items-center justify-center rounded-lg"
          onPress={() => {
            LucraSDK.acceptGamesMatchup('INSERT_ID_HERE', 'TEAM_ID').catch(
              (e) => {
                console.warn('Could not accept game match up', e);
              }
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
              .catch((e) => {
                console.warn('Could not cancel game match up', e);
              });
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
