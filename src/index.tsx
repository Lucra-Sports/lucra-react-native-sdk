import NativeLucraSDK from './NativeLucraSDK';

enum VerificationStatus {
  VERIFIED,
  UNVERIFIED,
  FAILED_VERIFICATION,
  ERRORED_VERIFICATION,
  PENDING_SCAN_VERIFICATION,
  CLOSED,
  CLOSED_PENDING,
  BLOCKED,
  SUSPENDED,
  SHOULD_SCAN,
}

export type LucraUserConfig = {
  username?: string;
  avatarURL?: string;
  phoneNumber?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  address?: {
    address?: string;
    adressCont?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
};

export type LucraUser = {
  id: string | null;
  username: string | null;
  avatarURL: string | null;
  phoneNumber: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  address: {
    address: string | null;
    addressCont: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
  } | null;
  balance: number;
  accountStatus: VerificationStatus;
};

const LucraClient = NativeLucraSDK;

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
  init: async (options: LucraSDKParams): Promise<void> => {
    await LucraClient.initialize(options);
  },
  registerUserCallback: (cb: (userData: LucraUser) => void) => {
    LucraClient.registerUserCallback(cb as any);
  },
  configurateUser: async (user: LucraUserConfig): Promise<void> => {
    await LucraClient.configureUser(user);
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
  acceptGamesMatchup: (matchupId: string, teamId: string): Promise<void> => {
    return LucraClient.acceptGamesMatchup(matchupId, teamId);
  },
  cancelGamesMatchup: (gameId: string): Promise<void> => {
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
