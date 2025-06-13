import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  Button,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { LucraSDK } from '@lucra-sports/lucra-react-native-sdk';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../Routes';
import { Assets } from '../../Assets';

type Props = NativeStackScreenProps<RootStackParamList, 'SportsYouWatch'>;

export const SportsYouWatch: React.FC<Props> = ({ navigation }) => {
  const [matchupID, setMatchupId] = useState('');
  const [info, setInfo] = useState('');
  const getMatchupInfo = async () => {
    // try {
    //   setInfo('Searching...');
    //   const matchupInfo = await LucraSDK.getSportsMatchup(matchupID);
    //   if (!matchupInfo) {
    //     setInfo('No matchup info');
    //     return;
    //   }
    //   setInfo(JSON.stringify(matchupInfo));
    // } catch (error) {
    //   setInfo(String(error));
    // }
  };
  return (
    <SafeAreaView className="flex-1 gap-4 bg-indigo-900 pt-12">
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Image
            source={Assets.ChevronLeft}
            className="h-8 w-8"
            tintColor={'white'}
          />
        </TouchableOpacity>
        <Text className="text-white">Sports You Watch</Text>
      </View>
      <View className="flex-1 p-4">
        <TextInput
          className="bg-white p-2"
          value={matchupID}
          onChangeText={setMatchupId}
          placeholder="Enter Matchup ID"
        />
        <Button title="Test" onPress={getMatchupInfo} />
        <ScrollView className="flex-1" contentContainerClassName="p-4">
          <Text className="text-white">{info}</Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};
