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
      LucraClient.initialize(authenticationClientID, environment, '');
    } else {
      LucraClient.initialize(authenticationClientID, environment);
    }
  },
  present: (flow: string) => {
    LucraClient.present(flow);
  },
  // API calls
  createGamesMatchup: (
    gameTypeId: string,
    wagerAmount: number
  ): Promise<{
    matchupId: string;
    ownerTeamId: string;
    opponentTeamId: string;
  }> => {
    return LucraClient.createGamesMatchup(gameTypeId, wagerAmount);
  },
  acceptGamesMatchup: (matchupId: string, teamId: string): Promise<null> => {
    return LucraClient.acceptGamesMatchup(matchupId, teamId);
  },
  cancelGamesMatchup: (gameId: string): Promise<null> => {
    return LucraClient.cancelGamesMatchup(gameId);
  },
};
