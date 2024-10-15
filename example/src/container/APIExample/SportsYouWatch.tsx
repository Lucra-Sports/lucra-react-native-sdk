import React, { useState } from 'react';
import { View, TextInput, Text, Button, ScrollView } from 'react-native';
import { LucraSDK } from '@lucra-sports/lucra-react-native-sdk';

export const SportsYouWatch = () => {
  const [matchupID, setMatchupId] = useState('');
  const [info, setInfo] = useState('');
  const getMatchupInfo = async () => {
    try {
      setInfo('Searching...');
      const matchupInfo = await LucraSDK.getSportsMatchup(matchupID);
      if (!matchupInfo) {
        setInfo('No matchup info');
        return;
      }
      setInfo(JSON.stringify(matchupInfo));
    } catch (error) {
      setInfo(String(error));
    }
  };
  return (
    <View className="gap-4 p-2">
      <Text className="font-bold">API Example Sports Matchup</Text>
      <TextInput
        className="bg-white p-2"
        value={matchupID}
        onChangeText={setMatchupId}
        placeholder="Enter Matchup ID"
      />
      <Button title="Test" onPress={getMatchupInfo} />
      <ScrollView className="bg-black p-2">
        <Text className="text-white">{info}</Text>
      </ScrollView>
    </View>
  );
};
