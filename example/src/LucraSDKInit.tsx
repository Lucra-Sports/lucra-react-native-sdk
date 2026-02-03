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
      apiKey: state.apiKey || defaultAppConfig.apiKey,
      environment: state.environment || defaultAppConfig.environment,
      urlScheme: defaultAppConfig.urlScheme,
      theme: {
        primary: state.theme?.primary ?? defaultAppConfig.theme.primary,
        secondary: state.theme?.secondary ?? defaultAppConfig.theme.secondary,
        tertiary: state.theme?.tertiary ?? defaultAppConfig.theme.tertiary,
        onPrimary: state.theme?.onPrimary ?? defaultAppConfig.theme.onPrimary,
        onSecondary:
          state.theme?.onSecondary ?? defaultAppConfig.theme.onSecondary,
        onTertiary:
          state.theme?.onTertiary ?? defaultAppConfig.theme.onTertiary,
        fontFamily: {
          normal:
            Platform.OS === 'ios'
              ? 'Inter Regular'
              : 'fonts/Inter-Regular.ttf',
          medium:
            Platform.OS === 'ios'
              ? 'Inter Medium'
              : 'fonts/Inter-Medium.ttf',
          semibold:
            Platform.OS === 'ios'
              ? 'Inter SemiBold'
              : 'fonts/Inter-SemiBold.ttf',
          bold:
            Platform.OS === 'ios' ? 'Inter Bold' : 'fonts/Inter-Bold.ttf',
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
          },
          () => {
            console.warn('You should show the rewards to the user');
          }
        );

        LucraSDK.addLucraFlowDismissedListener((lucraFlow) => {
          console.log('Lucra Flow Dismissed: ', lucraFlow);
        });

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
          onGamesMatchupStarted: (id: string) => {
            console.log('Games matchup started:', id);
            setEvents((events) => [
              ...events,
              { type: 'Games matchup started', id: id },
            ]);
          },
          onGamesMatchupStartedActive: (id: string) => {
            console.log('Games matchup started active:', id);
            setEvents((events) => [
              ...events,
              { type: 'Games matchup started active', id: id },
            ]);
          },
          onTournamentJoined: (id: string) => {
            console.log('Tournament joined:', id);
            setEvents((events) => [
              ...events,
              { type: 'Tournament joined', id: id },
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
