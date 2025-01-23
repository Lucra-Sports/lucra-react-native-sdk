import React from 'react';
import LucraClient from './NativeLucraClient';
export { default as LucraFlowView } from './LucraFlowViewNativeComponent';
import { default as LucraProfilePillNative } from './LucraProfilePillNativeComponent';
import { default as LucraCreateContestButtonNative } from './LucraCreateContestButtonNativeComponent';
import {
  StyleSheet,
  type ViewProps,
  type NativeEventSubscription,
  View,
  NativeEventEmitter,
} from 'react-native';
export { default as LucraMiniPublicFeed } from './LucraMiniPublicFeedNativeComponent';
export { default as LucraRecommendedMatchup } from './LucraRecommendedMatchupNativeComponent';
export { default as LucraContestCard } from './LucraContestCardNativeComponent';
import {
  type SportsMatchupType,
  type LucraReward,
  type PoolTournament,
} from './types';
import NativeLucraClient from './NativeLucraClient';
export { type LucraReward, type PoolTournament } from './types';

const eventEmitter = new NativeEventEmitter(LucraClient);

export const LucraCreateContestButton: React.FC<ViewProps> = (props) => {
  return (
    <View {...props}>
      <LucraCreateContestButtonNative
        style={defaultStyles.createContestButton}
      />
    </View>
  );
};

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
  createContestButton: {
    width: 100,
    height: 100,
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
    addressCont?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  dateOfBirth?: Date;
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
  dateOfBirth: Date | null;
};

if (LucraClient == null) {
  throw new Error(
    'Native LucraSDK is not found. You can try clearing your build cache and try again.'
  );
}

export enum LucraEnvironment {
  PRODUCTION = 'production',
  STAGING = 'staging',
  SANDBOX = 'sandbox',
  DEVELOP = 'develop',
}

export type LucraSDKParams = {
  apiURL: string;
  apiKey: string;
  environment: LucraEnvironment;
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
  urlScheme?: string;
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

type LucraConvertCreditResponse = {
  id: string;
  type: string;
  title: string;
  convertedAmount: number;
  iconUrl?: string | undefined;
  convertedAmountDisplay: string;
  shortDescription: string;
  longDescription: string;
  metaData: Record<string, string>;
  cardColor: string;
  cardTextColor: string;
  pillColor: string;
  pillTextColor: string;
};

let deepLinkSubscription: NativeEventSubscription;
let creditConversionSubscription: NativeEventSubscription;
let deepLinkEmitter: ((deepLink: string) => Promise<string>) | null = null;
let creditConversionEmitter:
  | ((cashAmount: number) => Promise<LucraConvertCreditResponse>)
  | null = null;

let availableRewardsSubscription: NativeEventSubscription;
let rewardEmitter: (() => Promise<Array<LucraReward>>) | null = null;
let claimRewardCallback: ((reward: LucraReward) => Promise<void>) | null = null;
let claimRewardSubscription: NativeEventSubscription;
let viewRewardsCallback: (() => void) | null = null;
let viewRewardsSubscription: NativeEventSubscription;

type LucraContestListeners = {
  onGamesMatchupCreated?: (id: string) => void;
  onSportsMatchupCreated?: (id: string) => void;
  onGamesMatchupAccepted?: (id: string) => void;
  onSportsMatchupAccepted?: (id: string) => void;
  onSportsMatchupCanceled?: (id: string) => void;
  onGamesMatchupCanceled?: (id: string) => void;
};

const Flows = {
  ONBOARDING: 'onboarding',
  VERIFY_IDENTITY: 'verifyIdentity',
  PROFILE: 'profile',
  ADD_FUNDS: 'addFunds',
  CREATE_GAMES_MATCHUP: 'createGamesMatchup',
  CREATE_SPORTS_MATCHUP: 'createSportsMatchup',
  WITHDRAW_FUNDS: 'withdrawFunds',
  PUBLIC_FEED: 'publicFeed',
  MY_MATCHUP: 'myMatchup',
  // GAME_CONTEST_DETAILS: 'gameContestDetails',
  // SPORT_CONTEST_DETAILS: 'sportContestDetails',
} as const;

type FlowNames = (typeof Flows)[keyof typeof Flows];

function present(params: { name: typeof Flows.ONBOARDING }): Promise<void>;
function present(params: { name: typeof Flows.VERIFY_IDENTITY }): Promise<void>;
function present(params: { name: typeof Flows.PROFILE }): Promise<void>;
function present(params: { name: typeof Flows.ADD_FUNDS }): Promise<void>;
function present(params: {
  name: typeof Flows.CREATE_GAMES_MATCHUP;
  gameId?: string;
}): Promise<void>;
function present(params: {
  name: typeof Flows.CREATE_SPORTS_MATCHUP;
}): Promise<void>;
function present(params: { name: typeof Flows.WITHDRAW_FUNDS }): Promise<void>;
function present(params: { name: typeof Flows.PUBLIC_FEED }): Promise<void>;
function present(params: { name: typeof Flows.MY_MATCHUP }): Promise<void>;
function present(params: { name: FlowNames; gameId?: string }) {
  return LucraClient.present(params);
}

export const LucraSDK = {
  ready: false,
  ENVIRONMENT: LucraEnvironment,
  FLOW: Flows,
  init: async (options: LucraSDKParams): Promise<void> => {
    await LucraClient.initialize(options);
    deepLinkSubscription?.remove();
    deepLinkSubscription = eventEmitter.addListener(
      '_deepLink',
      async (data) => {
        if (deepLinkEmitter) {
          let newDeepLink = await deepLinkEmitter(data.link);
          LucraClient.emitDeepLink(newDeepLink);
        }
      }
    );
    creditConversionSubscription?.remove();
    creditConversionSubscription = eventEmitter.addListener(
      '_creditConversion',
      async (data) => {
        if (creditConversionEmitter) {
          let newDeepLink = await creditConversionEmitter(data.amount);
          LucraClient.emitCreditConversion(newDeepLink);
        }
      }
    );
    availableRewardsSubscription?.remove();
    availableRewardsSubscription = eventEmitter.addListener(
      '_availableRewards',
      async () => {
        if (rewardEmitter) {
          let rewards = await rewardEmitter();
          LucraClient.emitAvailableRewards(rewards);
        }
      }
    );
    claimRewardSubscription?.remove();
    claimRewardSubscription = eventEmitter.addListener(
      '_claimReward',
      async (data) => {
        if (claimRewardCallback) {
          await claimRewardCallback(data.reward);
        }
      }
    );
    viewRewardsSubscription?.remove();
    viewRewardsSubscription = eventEmitter.addListener(
      '_viewRewards',
      async () => {
        if (viewRewardsCallback) {
          viewRewardsCallback();
        }
      }
    );
  },
  addContestListener: (listenerMap: LucraContestListeners) => {
    const gamesMatchupCreatedEmitter = eventEmitter.addListener(
      'gamesMatchupCreated',
      (data) => {
        listenerMap.onGamesMatchupCreated?.(data.id);
      }
    );

    const sportsMatchupCreatedEmitter = eventEmitter.addListener(
      'sportsMatchupCreated',
      (data) => {
        listenerMap.onSportsMatchupCreated?.(data.id);
      }
    );

    const gamesContextAcceptedEmitter = eventEmitter.addListener(
      'gamesMatchupAccepted',
      (data) => {
        listenerMap.onGamesMatchupAccepted?.(data.id);
      }
    );

    const sportMatchupAcceptedEmitter = eventEmitter.addListener(
      'sportsMatchupAccepted',
      (data) => {
        listenerMap.onSportsMatchupAccepted?.(data.id);
      }
    );

    const gamesMatchupCanceledEmitter = eventEmitter.addListener(
      'gamesMatchupCanceled',
      (data) => {
        listenerMap.onGamesMatchupCanceled?.(data.id);
      }
    );

    const sportsMatchupCanceledEmitter = eventEmitter.addListener(
      'sportsMatchupCanceled',
      (data) => {
        listenerMap.onSportsMatchupCanceled?.(data.id);
      }
    );

    return () => {
      gamesMatchupCreatedEmitter.remove();
      sportsMatchupCreatedEmitter.remove();
      gamesContextAcceptedEmitter.remove();
      sportMatchupAcceptedEmitter.remove();
      gamesMatchupCanceledEmitter.remove();
      sportsMatchupCanceledEmitter.remove();
    };
  },
  addListener: (type: 'user', cb: (data: any) => void) => {
    const emitter = eventEmitter.addListener(type, cb);
    return () => {
      emitter.remove();
    };
  },
  configureUser: async (user: LucraUserConfig): Promise<void> => {
    await LucraClient.configureUser(user);
  },
  getUser: async (): Promise<LucraUser> => {
    return (await LucraClient.getUser()) as LucraUser;
  },
  present: present,
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
  registerDeepLinkProvider: (provider: (url: string) => Promise<string>) => {
    deepLinkEmitter = provider;
  },
  registerCreditConversionProvider: (
    provider: (cashAmount: number) => Promise<LucraConvertCreditResponse>
  ) => {
    LucraClient.registerConvertToCreditProvider();
    creditConversionEmitter = provider;
  },
  handleLucraLink: async (link: string): Promise<boolean> => {
    return LucraClient.handleLucraLink(link);
  },
  registerDeviceTokenHex: async (token: string): Promise<void> => {
    return LucraClient.registerDeviceTokenHex(token);
  },
  registerDeviceTokenBase64: async (token: string): Promise<void> => {
    return LucraClient.registerDeviceTokenBase64(token);
  },
  getSportsMatchup: async (contestId: string): Promise<SportsMatchupType> => {
    return (await LucraClient.getSportsMatchup(contestId)) as SportsMatchupType;
  },
  registerRewardProvider: (
    getAvailableRewards: () => Promise<Array<LucraReward>>,
    claimReward: (reward: LucraReward) => Promise<void>,
    viewRewards: () => void
  ) => {
    NativeLucraClient.registerRewardProvider();
    rewardEmitter = getAvailableRewards;
    claimRewardCallback = claimReward;
    viewRewardsCallback = viewRewards;
  },
  // Pool tournaments
  // https://docs.lucrasports.com/lucra-sdk/DPHUTeEoFi2Jw8eLoOMk/integration-documents/pool-tournaments
  getRecomendedTournaments: async ({
    includeClosed = true,
    limit = 50,
  }: {
    includeClosed?: boolean;
    limit?: number;
  }): Promise<PoolTournament[]> => {
    return (await LucraClient.getRecommendedTournaments({
      includeClosed,
      limit,
    })) as PoolTournament[];
  },
  tournamentMatchup: async (tournamentId: string) => {
    return await LucraClient.tournamentMatchup(tournamentId);
  },
  joinTournament: async (tournamentId: string) => {
    return await LucraClient.joinTournament(tournamentId);
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
