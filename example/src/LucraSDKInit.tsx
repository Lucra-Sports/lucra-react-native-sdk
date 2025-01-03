import React from 'react';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import {
  LucraSDK,
  type LucraReward,
} from '@lucra-sports/lucra-react-native-sdk';

import { useAppContext } from './AppContext';
import { defaultAppConfig } from './AppConfig';
import { useEventsContext } from './EventsContext';

type LucraSDKInitProps = {
  onStateChange: (ready: boolean) => void;
};

const LucraSDKInit: React.FC<LucraSDKInitProps> = ({ onStateChange }) => {
  const { state, ready } = useAppContext();
  const [, setEvents] = useEventsContext();
  const [initialized, setInitialized] = useState(false);
  const urlScheme = defaultAppConfig.urlScheme;
  useEffect(() => {
    if (initialized || !ready) {
      return;
    }

    setInitialized(true);
    LucraSDK.init({
      apiURL: state.apiURL || defaultAppConfig.apiURL,
      apiKey: state.apiKey || defaultAppConfig.apiKey,
      environment: state.environment || defaultAppConfig.environment,
      urlScheme: defaultAppConfig.urlScheme,
      theme: {
        ...state.theme,
        fontFamily:
          Platform.OS === 'ios'
            ? 'Inter'
            : {
                normal: 'fonts/Inter-Regular.ttf',
                bold: 'fonts/Inter-Bold.ttf',
                semibold: 'fonts/Inter-SemiBold.ttf',
                medium: 'fonts/Inter-Medium.ttf',
              },
      },
    })
      .then(() => {
        LucraSDK.registerRewardProvider(
          async () => {
            // Available rewards
            const exampleRewards: LucraReward[] = [
              {
                rewardId: '1',
                title: 'Reward 1',
                descriptor: 'Some reward',
                iconUrl: 'https://picsum.photos/50',
                bannerIconUrl: 'https://picsum.photos/100/50',
                disclaimer: 'This is a test',
                metadata: null,
              },
              {
                rewardId: '2',
                title: 'Reward 2',
                descriptor: 'Other reward',
                iconUrl: '://picsum.photos/50',
                bannerIconUrl: 'https://picsum.photos/100/50',
                disclaimer: 'This is also a test',
                metadata: null,
              },
            ];
            return exampleRewards;
          },
          async (reward) => {
            setEvents((events) => [
              ...events,
              { type: 'Reward selected', id: JSON.stringify(reward) },
            ]);
          }
        );
        LucraSDK.addContestListener({
          onGamesMatchupCreated: (id: string) => {
            console.log('Games contest created:', id);
            setEvents((events) => [
              ...events,
              { type: 'Games contest created', id: id },
            ]);
          },
          onSportsMatchupCreated: (id: string) => {
            console.log('Sports contest created:', id);
            setEvents((events) => [
              ...events,
              { type: 'Sports contest created', id: id },
            ]);
          },
          onGamesMatchupAccepted: (id: string) => {
            console.log('Games contest accepted:', id);
            setEvents((events) => [
              ...events,
              { type: 'Games contest accepted', id: id },
            ]);
          },
          onSportsMatchupAccepted: (id: string) => {
            console.log('Sports contest accepted:', id);
            setEvents((events) => [
              ...events,
              { type: 'Sports contest accepted', id: id },
            ]);
          },
          onGamesMatchupCanceled: (id: string) => {
            console.log('Games matchup canceled:', id);
            setEvents((events) => [
              ...events,
              { type: 'Games matchup canceled', id: id },
            ]);
          },
          onSportsMatchupCanceled: (id: string) => {
            console.log('Sports matchup canceled:', id);
            setEvents((events) => [
              ...events,
              { type: 'Sports matchup canceled', id: id },
            ]);
          },
        });
        onStateChange(true);
      })
      .catch((error) => {
        console.error('Error initializing LucraSDK', error);
        setInitialized(false);
      });
  }, [state, ready, initialized, onStateChange, setEvents, urlScheme]);
  return null;
};

export default LucraSDKInit;
