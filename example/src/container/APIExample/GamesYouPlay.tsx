import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  Button,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LucraSDK } from '@lucra-sports/lucra-react-native-sdk';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../Routes';
import { Assets } from '../../Assets';

type Props = NativeStackScreenProps<RootStackParamList, 'GamesYouPlay'>;

export const GamesYouPlay: React.FC<Props> = ({ navigation }) => {
  const [wager, setWager] = useState(1);
  const [info, setInfo] = useState('');
  const [matchup, setMatchup] = useState<{ matchupId: string } | null>();
  const [fullMatchupInfo, setFullMatchupInfo] = useState('');
  const createGamesMatchup = async () => {
    try {
      setInfo('Creating game matchup');
      const matchupInfo = await LucraSDK.createGamesMatchup('DARTS', wager);
      setMatchup(matchupInfo);
      setInfo(JSON.stringify(matchupInfo));
    } catch (error) {
      console.error(error);
      setInfo(String(error));
    }
  };

  const loadFullMatchup = async () => {
    if (!matchup) {
      return;
    }
    try {
      const fullMatchup = await LucraSDK.getGamesMatchup(matchup?.matchupId);
      setFullMatchupInfo(JSON.stringify(fullMatchup));
    } catch (error) {
      setInfo(String(error));
    }
  };

  const cancelMatchup = async () => {
    if (!matchup) {
      return;
    }
    try {
      await LucraSDK.cancelGamesMatchup(matchup?.matchupId);
      setMatchup(null);
      setInfo('');
      setFullMatchupInfo('');
    } catch (error) {
      setInfo(String(error));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-indigo-900">
      <ScrollView className="flex-1" contentContainerClassName="p-4 gap-2">
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
          <Text className="text-white">Games You Play</Text>
        </View>
        <TextInput
          className="bg-white p-2"
          value={wager.toString()}
          onChangeText={(val) => setWager(parseInt(val, 10))}
          keyboardType="numeric"
          placeholder="Wager"
        />
        <Text className="text-white font-bold">Matchup info</Text>
        <Text className="text-white">{info}</Text>
        <Text className="text-white font-bold">Full Matchup info</Text>
        <Text className="text-white">{fullMatchupInfo}</Text>
        {!matchup ? (
          <Button title="Create Matchup" onPress={createGamesMatchup} />
        ) : (
          <View>
            <Button title="Load Full Matchup" onPress={loadFullMatchup} />
            <Button title="Cancel Matchup" onPress={cancelMatchup} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
