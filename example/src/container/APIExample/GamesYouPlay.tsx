import React, { useState } from 'react';
import { View, TextInput, Text, Button, ScrollView } from 'react-native';
import { LucraSDK } from '@lucra-sports/lucra-react-native-sdk';

export const GamesYouPlay = () => {
  const [wager, setWager] = useState(1);
  const [info, setInfo] = useState('');
  const [matchup, setMatchup] = useState<{ matchupId: string } | null>();
  const [fullMatchupInfo, setFullMatchupInfo] = useState('');
  const createGamesMatchup = async () => {
    setInfo('Creating game matchup');
    const matchupInfo = await LucraSDK.createGamesMatchup('DARTS', wager);
    setMatchup(matchupInfo);
    setInfo(JSON.stringify(matchupInfo));
  };

  const loadFullMatchup = async () => {
    if (!matchup) {
      return;
    }
    try {
      console.log('trying to get', matchup.matchupId);
      const fullMatchup = await LucraSDK.getGamesMatchup(matchup?.matchupId);
      setFullMatchupInfo(JSON.stringify(fullMatchup));
    } catch (error) {
      setInfo(String(error));
      console.error(error);
    }
  };
  const cancelMatchup = async () => {
    if (!matchup) {
      return;
    }
    await LucraSDK.cancelGamesMatchup(matchup?.matchupId);
    setMatchup(null);
    setInfo('');
    setFullMatchupInfo('');
  };
  return (
    <ScrollView className="gap-4 p-2">
      <Text className="font-bold">API Example Create Games Matchup</Text>
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
  );
};
