import React from 'react';
import LucraClient from './NativeLucraClient';
export { default as LucraFlowView } from './LucraFlowView';
import { default as LucraProfilePillNative } from './LucraProfilePillComponent';
import { StyleSheet, ViewProps, View, NativeEventEmitter } from 'react-native';
export { default as LucraMiniPublicFeed } from './LucraMiniPublicFeedComponent';

const eventEmitter = new NativeEventEmitter(LucraClient);

export const LucraProfilePill: React.FC<ViewProps> = (props) => {
  return (
    <View {...props}>
      <LucraProfilePillNative style={defaultStyles.profilePill} />
    </View>
  );
};

const defaultStyles = StyleSheet.create({
  profilePill: {
    width: 180,
    height: 50,
  },
});

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

if (LucraClient == null) {
  throw new Error(
    'Native LucraSDK is not found. You can try clearing your build cache and try again.'
  );
}

type LucraSDKParams = {
  apiURL: string;
  apiKey: string;
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

type MatchupUserInfo = {
  id: string;
  username: string;
};

type MatchupTeamInfo = {
  id: string;
  outcome: string;
  users: MatchupUserInfo[];
};

type MatchupInfo = {
  gameType: string;
  createdAt: string;
  ownerId: string;
  status: string;
  updatedAt: string;
  wagerAmount: number;
  teams: MatchupTeamInfo[];
};

export const LucraSDK = {
  ENVIRONMENT: {
    PRODUCTION: 'production',
    STAGING: 'staging',
    SANDBOX: 'sandbox',
    DEVELOP: 'develop',
  },
  FLOW: {
    ONBOARDING: 'onboarding',
    VERIFY_IDENTITY: 'verifyIdentity',
    PROFILE: 'profile',
    ADD_FUNDS: 'addFunds',
    CREATE_GAMES_MATCHUP: 'createGamesMatchup',
    CREATE_SPORTS_MATCHUP: 'createSportsMatchup',
    WITHDRAW_FUNDS: 'withdrawFunds',
    PUBLIC_FEED: 'publicFeed',
    MY_MATCHUP: 'myMatchup',
  },
  init: async (options: LucraSDKParams): Promise<void> => {
    await LucraClient.initialize(options);
  },
  addListener: (type: 'user', cb: (data: any) => void) => {
    return eventEmitter.addListener(type, cb);
  },
  configureUser: async (user: LucraUserConfig): Promise<void> => {
    await LucraClient.configureUser(user);
  },
  getUser: async (): Promise<LucraUser> => {
    return (await LucraClient.getUser()) as LucraUser;
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
  getGamesMatchup: async (gameId: string): Promise<MatchupInfo> => {
    return (await LucraClient.getGamesMatchup(gameId)) as MatchupInfo;
  },
  logout: (): Promise<void> => {
    return LucraClient.logout();
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
