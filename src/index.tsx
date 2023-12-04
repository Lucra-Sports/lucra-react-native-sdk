import { NativeModules } from 'react-native';

const LucraClient = NativeModules.LucraClient;

if (LucraClient == null) {
  throw new Error(
    'LucraClient is not found. You can try clearing your build cache and try again.'
  );
}

type LucraSDKParams = {
  authenticationClientId: string;
  environment: string;
  theme?: {
    background?: string;
    surface?: string;
    primary?: string;
    secondary?: string;
    tertiary?: string;
    onBackground?: string;
    onSurface?: string;
    onPrimary?: string;
    onSecondary?: string;
    onTertiary?: string;
    fontFamily?:
      | {
          bold?: string;
          semibold?: string;
          normal?: string;
          medium?: string;
        }
      | string;
  };
  merchantID?: string;
};

export const LucraSDK = {
  ENVIRONMENT: {
    PRODUCTION: 'production',
    SANDBOX: 'sandbox',
  },
  FLOW: {
    ONBOARDING: 'onboarding',
    VERIFY_IDENTITY: 'verifyIdentity',
    PROFILE: 'profile',
    ADD_FUNDS: 'addFunds',
    CREATE_GAMES_MATCHUP: 'createGamesMatchup',
    WITHDRAW_FUNDS: 'withdrawFunds',
    PUBLIC_FEED: 'publicFeed',
    MY_MATCHUP: 'myMatchup',
  },
  init: (options: LucraSDKParams) => {
    LucraClient.initialize(options);
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

export type LucraSDKError = {
  code:
    | 'notInitialized'
    | 'unverified'
    | 'notAllowed'
    | 'insufficientFunds'
    | 'apiError'
    | 'locationError'
    | 'unknown';
} & Error;
