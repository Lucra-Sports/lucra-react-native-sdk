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
      console.warn('LucraSDK initialized');
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
  ): Promise<null> => {
    if (Platform.OS === 'ios') {
      console.warn('trying to create games matchup', LucraClient);
      return LucraClient.createGamesMatchup(gameTypeId, wagerAmount);
    } else {
      // TODO
      throw new Error('Not implemented on Android');
    }
  },
  acceptGamesMatchup: (
    matchupId: string,
    teamId: string
  ): Promise<{
    matchupId: string;
    ownerTeamId: string;
    opponentTeamId: string;
  }> => {
    if (Platform.OS === 'ios') {
      console.warn('trying to create games matchup', LucraClient);
      return LucraClient.acceptGamesMatchup(matchupId, teamId);
    } else {
      // TODO
      throw new Error('Not implemented on Android');
    }
  },
  cancelGamesMatchup: (gameId: string): Promise<null> => {
    if (Platform.OS === 'ios') {
      return LucraClient.cancelGamesMatchup(gameId);
    } else {
      // TODO
      throw new Error('Not implemented on Android');
    }
  },
};
