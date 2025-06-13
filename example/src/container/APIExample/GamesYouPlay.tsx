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
import Clipboard from '@react-native-clipboard/clipboard';

type Props = NativeStackScreenProps<RootStackParamList, 'GamesYouPlay'>;

export const GamesYouPlay: React.FC<Props> = ({ navigation }) => {
  const [wager, setWager] = useState('');
  const [gameType, setGameType] = useState('DARTS');
  const [gameFormat, setGameFormat] = useState('freeforall');
  const [info, setInfo] = useState('');
  const [matchup, setMatchup] = useState<{ matchupId: string } | null>();
  const [fullMatchupInfo, setFullMatchupInfo] = useState('');
  const [stakeType, setStakeType] = useState<'cash' | 'tenantreward'>('cash');

  const createGamesMatchup = async () => {
    try {
      setInfo('Creating game matchup');
      let stake;
      if (stakeType === 'cash') {
        stake = {
          type: 'cash',
          amount: parseInt(wager, 10),
        };
      } else {
        stake = {
          type: 'tenantreward',
          rewardId: 'reward_001',
          title: 'Client Appetizer',
          descriptor: '10% off',
          iconUrl: 'https://picsum.photos/200',
          bannerIconUrl: 'https://picsum.photos/200',
          disclaimer: '*Can only be redeemed once per week',
          metadata: {
            custom_data: '{"type":"food","expiry":"2024-12-31"}',
            simple_data: 'primitive_type_to_string',
          },
        };
      }
      const matchupInfo = await LucraSDK.createRecreationalGame(
        gameType,
        stake,
        gameFormat
      );
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
      const fullMatchup = await LucraSDK.getMatchup(matchup?.matchupId);
      setFullMatchupInfo(JSON.stringify(fullMatchup, null, 2));
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
    <SafeAreaView className="flex-1 bg-indigo-900 pt-8">
      <ScrollView className="flex-1" contentContainerClassName="p-4 gap-2">
        <View className="flex-row items-center h-20 px-4">
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}
          >
            <Image
              source={Assets.ChevronLeft}
              className="h-12 w-12"
              tintColor={'white'}
            />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">
            Games You Play
          </Text>
        </View>
      
        <Text className="text-white font-bold">Stake Type</Text>
        <View className="flex-row mb-2">
          <TouchableOpacity
            className={`flex-1 p-2 m-1 rounded ${stakeType === 'cash' ? 'bg-indigo-600' : 'bg-white'}`}
            onPress={() => setStakeType('cash')}
          >
            <Text className={stakeType === 'cash' ? 'text-white font-bold text-center' : 'text-indigo-900 text-center'}>
              Cash
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 p-2 m-1 rounded ${stakeType === 'tenantreward' ? 'bg-indigo-600' : 'bg-white'}`}
            onPress={() => setStakeType('tenantreward')}
          >
            <Text className={stakeType === 'tenantreward' ? 'text-white font-bold text-center' : 'text-indigo-900 text-center'}>
              Reward
            </Text>
          </TouchableOpacity>
        </View>
        {stakeType === 'cash' && (
          <TextInput
            className="bg-white p-2"
            value={wager}
            onChangeText={(val) => {
              if (val === '') {
                setWager('');
              } else {
                const num = parseInt(val, 10);
                if (!isNaN(num)) {
                  setWager(num < 1 ? '1' : num.toString());
                }
              }
            }}
            onBlur={() => {
              if (wager === '' || parseInt(wager, 10) < 1 || isNaN(parseInt(wager, 10))) {
                setWager('1');
              }
            }}
            keyboardType="numeric"
            placeholder="Wager in dollars"
            placeholderTextColor="#888"
          />
        )}
        <Text className="text-white font-bold">Game Type</Text>
        <TextInput
          className="bg-white p-2"
          value={gameType}
          onChangeText={setGameType}
          placeholder="Game Type (e.g. DARTS)"
        />
        <Text className="text-white font-bold">Game Format</Text>
        <View className="flex-row mb-2">
          <TouchableOpacity
            className={`flex-1 p-2 m-1 rounded ${gameFormat === 'freeforall' ? 'bg-indigo-600' : 'bg-white'}`}
            onPress={() => setGameFormat('freeforall')}
          >
            <Text className={gameFormat === 'freeforall' ? 'text-white font-bold text-center' : 'text-indigo-900 text-center'}>
              Free For All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 p-2 m-1 rounded ${gameFormat === 'groupvsgroup' ? 'bg-indigo-600' : 'bg-white'}`}
            onPress={() => setGameFormat('groupvsgroup')}
          >
            <Text className={gameFormat === 'groupvsgroup' ? 'text-white font-bold text-center' : 'text-indigo-900 text-center'}>
              Versus
            </Text>
          </TouchableOpacity>
        </View>
        <Text className="text-white font-bold">Matchup info</Text>
        {matchup?.matchupId ? (
          <View className="w-full bg-gray-900 border border-indigo-400 rounded-lg mt-2 p-2">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-indigo-300 font-bold">Matchup ID</Text>
              <TouchableOpacity
                onPress={() => Clipboard.setString(matchup.matchupId)}
                className="px-2 py-1 bg-indigo-700 rounded"
              >
                <Text className="text-white text-xs">Copy</Text>
              </TouchableOpacity>
            </View>
            <Text
              selectable
              style={{ fontFamily: 'Menlo', color: '#fff', fontSize: 14 }}
            >
              {matchup.matchupId}
            </Text>
          </View>
        ) : null}
        <Text className="text-white">{info}</Text>
        <Text className="text-white font-bold">Full Matchup info</Text>
        {fullMatchupInfo ? (
          <View className="w-full bg-gray-900 border border-indigo-400 rounded-lg mt-2 p-2">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-indigo-300 font-bold">Full Matchup JSON</Text>
              <TouchableOpacity
                onPress={() => {
                  Clipboard.setString(fullMatchupInfo);
                }}
                className="px-2 py-1 bg-indigo-700 rounded"
              >
                <Text className="text-white text-xs">Copy</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 300 }}>
              <Text
                selectable
                style={{ fontFamily: 'Menlo', color: '#fff', fontSize: 12 }}
              >
                {fullMatchupInfo}
              </Text>
            </ScrollView>
          </View>
        ) : null}
        {!matchup ? (
          <Button title="Create Matchup" onPress={createGamesMatchup} />
        ) : (
          <View>
            <View style={{ gap: 12 }}>
              <Button title="Load Full Matchup" onPress={loadFullMatchup} />
              <Button title="Cancel Matchup" onPress={cancelMatchup} />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
