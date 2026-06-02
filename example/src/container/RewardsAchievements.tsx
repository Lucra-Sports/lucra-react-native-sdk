import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {
  LucraSDK,
  type LucraTournamentReward,
  type LucraAchievement,
} from '@lucra-sports/lucra-react-native-sdk';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../Routes';
import { Assets } from '../Assets';

type Props = NativeStackScreenProps<RootStackParamList, 'RewardsAchievements'>;

// Small reusable JSON result panel with copy.
const ResultBox: React.FC<{ title: string; value: string }> = ({
  title,
  value,
}) => {
  if (!value) {
    return null;
  }
  return (
    <View className="w-full bg-gray-900 border border-indigo-400 rounded-lg mt-1 p-2">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-indigo-300 font-bold">{title}</Text>
        <TouchableOpacity
          onPress={() => Clipboard.setString(value)}
          className="px-2 py-1 bg-indigo-700 rounded"
        >
          <Text className="text-white text-xs">Copy</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.resultScroll}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
      >
        <Text selectable className="font-mono text-white text-xs">
          {value}
        </Text>
      </ScrollView>
    </View>
  );
};

const ActionButton: React.FC<{
  label: string;
  onPress: () => void;
  busy?: boolean;
  variant?: 'primary' | 'secondary';
}> = ({ label, onPress, busy, variant = 'primary' }) => (
  <TouchableOpacity
    className={`w-full p-3 items-center justify-center rounded-lg ${
      variant === 'primary' ? 'bg-green-600' : 'bg-indigo-600'
    }`}
    onPress={onPress}
    disabled={busy}
  >
    {busy ? (
      <ActivityIndicator color="white" />
    ) : (
      <Text className="text-white font-bold text-center">{label}</Text>
    )}
  </TouchableOpacity>
);

export const RewardsAchievements: React.FC<Props> = ({ navigation }) => {
  // Rewards
  const [rewardsResult, setRewardsResult] = useState('');
  const [rewardId, setRewardId] = useState('');
  // Achievements
  const [achievementsResult, setAchievementsResult] = useState('');
  const [userAchievementId, setUserAchievementId] = useState('');

  const [busy, setBusy] = useState<string | null>(null);

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    try {
      await fn();
    } catch (e: any) {
      const msg = `Error [${e?.code ?? 'unknown'}]: ${e?.message ?? String(e)}`;
      if (key.startsWith('reward')) {
        setRewardsResult(msg);
      } else {
        setAchievementsResult(msg);
      }
    } finally {
      // Only clear if this request is still the in-flight one, so a later
      // action's finally doesn't wipe an earlier one's busy state.
      setBusy((curr) => (curr === key ? null : curr));
    }
  };

  const fetchRewards = () =>
    run('rewards:fetch', async () => {
      const rewards: LucraTournamentReward[] =
        await LucraSDK.getUserTournamentRewards({});
      setRewardsResult(JSON.stringify(rewards, null, 2));
      // Auto-fill the rewardId for claim/view convenience (clear if none).
      setRewardId(rewards[0]?.id ?? '');
    });

  const claimReward = () =>
    run('reward:claim', async () => {
      if (!rewardId.trim()) {
        setRewardsResult('Enter a reward ID first.');
        return;
      }
      await LucraSDK.claimReward(rewardId.trim());
      setRewardsResult(`Claimed reward ${rewardId.trim()} ✓`);
    });

  const markRewardViewed = () =>
    run('reward:viewed', async () => {
      if (!rewardId.trim()) {
        setRewardsResult('Enter a reward ID first.');
        return;
      }
      await LucraSDK.markRewardViewed(rewardId.trim());
      setRewardsResult(`Marked reward ${rewardId.trim()} viewed ✓`);
    });

  const fetchAchievements = () =>
    run('achievements:fetch', async () => {
      const achievements: LucraAchievement[] =
        await LucraSDK.getUserAchievements({ includeNoProgress: true });
      setAchievementsResult(JSON.stringify(achievements, null, 2));
      setUserAchievementId(achievements[0]?.id ?? '');
    });

  const claimAchievement = () =>
    run('achievement:claim', async () => {
      if (!userAchievementId.trim()) {
        setAchievementsResult('Enter a user achievement ID first.');
        return;
      }
      await LucraSDK.claimAchievement(userAchievementId.trim());
      setAchievementsResult(
        `Claimed achievement ${userAchievementId.trim()} ✓`
      );
    });

  const markAchievementViewed = () =>
    run('achievement:viewed', async () => {
      if (!userAchievementId.trim()) {
        setAchievementsResult('Enter a user achievement ID first.');
        return;
      }
      await LucraSDK.markAchievementViewed(userAchievementId.trim());
      setAchievementsResult(
        `Marked achievement ${userAchievementId.trim()} viewed ✓`
      );
    });

  return (
    <SafeAreaView className="flex-1 bg-indigo-900 pt-8">
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 gap-3 pb-12"
      >
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={Assets.ChevronLeft}
              className="h-10 w-10"
              tintColor={'white'}
            />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold ml-2">
            Rewards & Achievements
          </Text>
        </View>

        {/* Rewards */}
        <Text className="text-white text-lg font-bold mt-2">Rewards</Text>
        <ActionButton
          label="Fetch Tournament/Minigame Rewards"
          onPress={fetchRewards}
          busy={busy === 'rewards:fetch'}
        />
        <Text className="text-white">Reward ID</Text>
        <TextInput
          value={rewardId}
          onChangeText={setRewardId}
          placeholder="Reward ID (auto-filled from fetch)"
          placeholderTextColor="#999"
          autoCapitalize="none"
          autoCorrect={false}
          className="border border-indigo-400 p-3 rounded-lg text-white"
        />
        <View className="flex-row gap-2">
          <View className="flex-1">
            <ActionButton
              label="Claim Reward"
              onPress={claimReward}
              busy={busy === 'reward:claim'}
              variant="secondary"
            />
          </View>
          <View className="flex-1">
            <ActionButton
              label="Mark Reward Viewed"
              onPress={markRewardViewed}
              busy={busy === 'reward:viewed'}
              variant="secondary"
            />
          </View>
        </View>
        <ResultBox title="Rewards result" value={rewardsResult} />

        {/* Achievements */}
        <Text className="text-white text-lg font-bold mt-4">Achievements</Text>
        <ActionButton
          label="Fetch User Achievements"
          onPress={fetchAchievements}
          busy={busy === 'achievements:fetch'}
        />
        <Text className="text-white">User Achievement ID</Text>
        <TextInput
          value={userAchievementId}
          onChangeText={setUserAchievementId}
          placeholder="User Achievement ID (auto-filled from fetch)"
          placeholderTextColor="#999"
          autoCapitalize="none"
          autoCorrect={false}
          className="border border-indigo-400 p-3 rounded-lg text-white"
        />
        <View className="flex-row gap-2">
          <View className="flex-1">
            <ActionButton
              label="Claim Achievement"
              onPress={claimAchievement}
              busy={busy === 'achievement:claim'}
              variant="secondary"
            />
          </View>
          <View className="flex-1">
            <ActionButton
              label="Mark Achievement Viewed"
              onPress={markAchievementViewed}
              busy={busy === 'achievement:viewed'}
              variant="secondary"
            />
          </View>
        </View>
        <ResultBox title="Achievements result" value={achievementsResult} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = {
  resultScroll: { maxHeight: 240 },
};
