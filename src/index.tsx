import { NativeModules, Platform } from 'react-native';

const LucraClient = NativeModules.LucraClient;

if (LucraClient == null) {
  throw new Error(
    'LucraClient is not found. You can try clearing your build cache and try again.'
  );
}

export const LucraSDK = {
  ENVIRONMENT: {
    PRODUCTION: 'production',
    STAGING: 'staging',
  },
  FLOW: {
    PROFILE: 'profile',
    ADD_FUNDS: 'addFunds',
  },
  init: (authenticationClientID: string, environment: string) => {
    if (Platform.OS === 'ios') {
      // TODO: third param 'urlScheme' might be eventually retired from the iOS SDK
      LucraClient.createInstance(authenticationClientID, environment, '');
    } else {
      LucraClient.createInstance(authenticationClientID, environment);
    }
  },
  present: (flow: string) => {
    LucraClient.present(flow);
  },
};
