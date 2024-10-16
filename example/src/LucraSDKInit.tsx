import React from 'react';
import { useEffect, useState } from 'react';
import { Platform, type EmitterSubscription } from 'react-native';
import { PERMISSIONS, request } from 'react-native-permissions';
import { LucraSDK } from '@lucra-sports/lucra-react-native-sdk';

import { useAppContext } from './AppContext';
import { defaultAppConfig } from './AppConfig';
import { useEventsContext } from './EventsContext';
import { setupDeepLink } from './setupDeepLink';

type LucraSDKInitProps = {
  onStateChange: (ready: boolean) => void;
};

const LucraSDKInit: React.FC<LucraSDKInitProps> = ({ onStateChange }) => {
  const { state, ready } = useAppContext();
  const [, setEvents] = useEventsContext();
  const [initialized, setInitialized] = useState(false);
  const urlScheme = state.urlScheme
    ? state.urlScheme
    : defaultAppConfig.urlScheme;
  useEffect(() => {
    if (initialized || !ready) {
      return;
    }
    let deepLinkListener: EmitterSubscription;
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
        deepLinkListener = setupDeepLink(urlScheme);
        LucraSDK.addContestListener({
          onGamesContestCreated: (contestId: string) => {
            console.log('Games contest created:', contestId);
            setEvents((events) => [
              ...events,
              { type: 'Games contest created', id: contestId },
            ]);
          },
          onSportsContestCreated: (contestId: string) => {
            console.log('Sports contest created:', contestId);
            setEvents((events) => [
              ...events,
              { type: 'Sports contest created', id: contestId },
            ]);
          },
          onGamesContestAccepted: (contestId: string) => {
            console.log('Games contest accepted:', contestId);
            setEvents((events) => [
              ...events,
              { type: 'Games contest accepted', id: contestId },
            ]);
          },
          onSportsContestAccepted: (contestId: string) => {
            console.log('Sports contest accepted:', contestId);
            setEvents((events) => [
              ...events,
              { type: 'Sports contest accepted', id: contestId },
            ]);
          },
        });
        onStateChange(true);
      })
      .catch((error) => {
        setInitialized(false);
        console.error('Error initializing LucraSDK', error);
      });

    if (Platform.OS === 'android') {
      request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
        .then((result) => {
          console.log('Permission result:', result);
        })
        .catch((error) => {
          console.log('Permission error:', error);
        });
    }
    return () => {
      deepLinkListener?.remove();
    };
  }, [state, ready, initialized, onStateChange, setEvents, urlScheme]);
  return null;
};

export default LucraSDKInit;
