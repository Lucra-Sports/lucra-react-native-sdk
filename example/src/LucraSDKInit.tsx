import { useEffect, type FC } from 'react';
import { Platform } from 'react-native';
import { PERMISSIONS, request } from 'react-native-permissions';
import { LucraSDK } from '@lucra-sports/lucra-react-native-sdk';

import { useAppContext } from './AppContext';

type LucraSDKInitProps = {
  onStateChange: (ready: boolean) => void;
};

const LucraSDKInit: FC<LucraSDKInitProps> = ({ onStateChange }) => {
  const { theme } = useAppContext();
  useEffect(() => {
    LucraSDK.init({
      apiURL: 'api-sample.sandbox.lucrasports.com',
      apiKey: 'YGugBV5xGsicmp48syEcDlBUQ98YeHE5',
      environment: LucraSDK.ENVIRONMENT.SANDBOX,
      theme: {
        ...theme,
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
        console.log('finished');
        onStateChange(true);
      })
      .catch((error) => {
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
  }, [theme, onStateChange]);
  return null;
};

export default LucraSDKInit;
