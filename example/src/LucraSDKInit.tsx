import { useEffect, useState, type FC } from 'react';
import { Platform } from 'react-native';
import { PERMISSIONS, request } from 'react-native-permissions';
import { LucraSDK } from '@lucra-sports/lucra-react-native-sdk';

import { useAppContext } from './AppContext';

type LucraSDKInitProps = {
  onStateChange: (ready: boolean) => void;
};

const LucraSDKInit: FC<LucraSDKInitProps> = ({ onStateChange }) => {
  const { state, ready } = useAppContext();
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (initialized || !ready) {
      return;
    }
    setInitialized(true);
    LucraSDK.init({
      apiURL: state.apiURL,
      apiKey: state.apiKey,
      environment: state.environment,
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
        LucraSDK.registerDeepLinkProvider(async () => {
          return 'lucra://flow/profile';
        });

        LucraSDK.addContestListener({
          onGamesContestCreated: (contestId: string) => {
            console.log('Games contest created:', contestId);
          },
          onSportsContestCreated: (contestId: string) => {
            console.log('Sports contest created:', contestId);
          },
          onGamesContestAccepted: (contestId: string) => {
            console.log('Games contest accepted:', contestId);
          },
          onSportsContestAccepted: (contestId: string) => {
            console.log('Sports contest accepted:', contestId);
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
  }, [state, ready, initialized, onStateChange]);
  return null;
};

export default LucraSDKInit;
