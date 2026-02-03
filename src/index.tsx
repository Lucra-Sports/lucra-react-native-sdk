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
import { type LucraReward, type PoolTournament } from './types';
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
  metadata?: Record<string, string>;
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
  metadata?: Record<string, string> | null;
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
  apiKey: string;
  environment: LucraEnvironment;
  theme?: {
    primary?: string;
    secondary?: string;
    tertiary?: string;
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

export type MatchupInfo = {
  id: string;
  updatedAt: string;
  createdAt: string;
  creatorId: string;
  status: string;
  subtype: string;
  type: string;
  isPublic: boolean;
  creator?: MatchupUserInfo;
  participantGroups: MatchupTeamInfo[];
  winningGroupId?: string;
  recreationGameExtension?: {
    gameId: string;
    buyInAmount: number;
    game?: {
      id: string;
      name: string;
      description?: string;
      iconUrl?: string;
      imageUrl?: string;
      imageBgUrl?: string;
      categoryIds: string[];
      groupTitle?: string;
      isFeatured: boolean;
      howToWin?: string;
      moreInfoHowToWin?: GamesMoreInfoData;
      moreInfoTrackResults?: GamesMoreInfoData;
    };
  };
};

export type MatchupUserInfo = {
  id: string;
  socialConnectionId?: string;
  username: string;
  avatarUrl?: string;
  loyaltyPoints: number;
};

export type MatchupTeamInfo = {
  id: string;
  createdAt: string;
  outcome: 'WIN' | 'LOSS' | 'TIE' | 'UNKNOWN' | '';
  participants: MatchupParticipantInfo[];
  professionalPlayerStatDetails?: PlayerStatDetails;
  professionalTeamStatDetails?: TeamStatDetails;
  recreationalGameStatDetails?: RecreationalGameStatDetails;
};

export type MatchupParticipantInfo = {
  wager: number;
  user: MatchupUserInfo;
  reward?: MatchupRewardInfo;
  tournamentLeaderboard?: MatchupLeaderboardInfo;
};

export type MatchupRewardInfo = {
  rewardId: string;
  title: string;
  descriptor: string;
  iconUrl: string;
  bannerIconUrl?: string;
  disclaimer?: string;
  metadata?: Record<string, string>;
};

export type MatchupLeaderboardInfo = {
  title?: string;
  userScore?: string;
  place?: number;
  placeOverride?: number;
  isTieResult: boolean;
  rewardValue?: number;
  rewardTierValue?: number;
  participantGroupId?: string;
  username?: string;
};

export type PlayerStatDetails = {
  metric: MatchupMetric;
  metricValue: number;
  spread: number;
  player: MatchupPlayer;
  schedule: MatchupSchedule;
};

export type TeamStatDetails = {
  metric: MatchupMetric;
  metricValue: number;
  spread: number;
  team: MatchupTeam;
  schedule: MatchupSchedule;
};

export type RecreationalGameStatDetails = {
  score: string;
  teamName: string;
  handicap?: number;
};

export type MatchupMetric = {
  id: string;
  displayName: string;
  pluralDisplayName: string;
  shortName: string;
  maxValue: number;
  active: boolean;
  comparisonType: string;
};

export type MatchupPlayer = {
  id: string;
  firstName: string;
  lastName: string;
  headshotUrl: string;
  lucraPosition: string;
  position: string;
  positionAbbreviation: string;
  status: string;
  isAvailable: boolean;
  sport: MatchupSport;
  positionMetrics: MatchupMetric[];
  projectedStats: MatchupPlayerStat[];
  seasonAvgStats: MatchupPlayerStat[];
  liveGameStats: MatchupPlayerStat[];
  team: MatchupTeam;
  league?: MatchupLeague;
  ranking?: number;
  schedule: MatchupSchedule;
};

export type MatchupPlayerStat = {
  metricId: string;
  value: string;
};

export type MatchupTeam = {
  id: string;
  fullName: string;
  name: string;
  abbreviation: string;
  sport: MatchupSport;
};

export type MatchupLeague = {
  id: string;
  name: string;
  logoUrl: string;
  priority: number;
  schedules: MatchupSchedule[];
};

export type MatchupSport = {
  id: string;
  name: string;
  iconUrl: string;
  priority: number;
  leagues: MatchupLeague[];
  intervals: SportInterval[];
};

export type MatchupSchedule = {
  id: string;
  date: string;
  channel: string;
  status: string;
  homeTeam: MatchupTeam;
  awayTeam: MatchupTeam;
  players: MatchupPlayer[];
  venue: string;
  roundName: string;
  statusDescription: string;
  homeScore: string;
  awayScore: string;
  sport: MatchupSport;
  projectionsPending?: boolean;
};

export type SportInterval = {
  interval: number;
  displayName: string;
};

export type GamesMoreInfoData = {
  name: string;
  description?: string;
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
let lucraFlowDismissedSubscription: NativeEventSubscription;
let lucraFlowDismissedCallback: ((flow: string) => void) | null = null;

type LucraContestListeners = {
  onGamesMatchupCreated?: (id: string) => void;
  onSportsMatchupCreated?: (id: string) => void;
  onGamesMatchupAccepted?: (id: string) => void;
  onSportsMatchupAccepted?: (id: string) => void;
  onSportsMatchupCanceled?: (id: string) => void;
  onGamesMatchupCanceled?: (id: string) => void;
  onGamesMatchupStarted?: (id: string) => void;
  onGamesMatchupStartedActive?: (id: string) => void;
  onTournamentJoined?: (id: string) => void;
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
  GAMES_CONTEST_DETAILS: 'gamesMatchupDetails',
  MATCHUP_DETAILS: 'matchupDetails',
  DEMOGRAPHIC_COLLECTION: 'demographicCollection',
  WALLET: 'wallet',
  HOME_PAGE: 'homePage',
  // SPORT_CONTEST_DETAILS: 'sportContestDetails',
} as const;

type FlowNames = (typeof Flows)[keyof typeof Flows];

function present(params: { name: typeof Flows.ONBOARDING }): Promise<void>;
function present(params: { name: typeof Flows.VERIFY_IDENTITY }): Promise<void>;
function present(params: { name: typeof Flows.PROFILE }): Promise<void>;
function present(params: { name: typeof Flows.ADD_FUNDS }): Promise<void>;
function present(params: { name: typeof Flows.WALLET }): Promise<void>;
function present(params: {
  name: typeof Flows.HOME_PAGE;
  locationId?: string;
}): Promise<void>;

function present(params: {
  name: typeof Flows.GAMES_CONTEST_DETAILS | typeof Flows.MATCHUP_DETAILS;
  matchupId: string;
}): Promise<void>;

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
function present(params: {
  name: typeof Flows.DEMOGRAPHIC_COLLECTION;
}): Promise<void>;
function present(params: {
  name: FlowNames;
  gameId?: string;
  matchupId?: string;
  locationId?: string;
}): Promise<void> {
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
    lucraFlowDismissedSubscription?.remove();
    lucraFlowDismissedSubscription = eventEmitter.addListener(
      'lucraFlowDismissed',
      (data) => {
        if (lucraFlowDismissedCallback) {
          lucraFlowDismissedCallback(data.lucraFlow);
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

    const gamesMatchupStartedEmitter = eventEmitter.addListener(
      'gamesMatchupStarted',
      (data) => {
        listenerMap.onGamesMatchupStarted?.(data.id);
      }
    );

    const gamesMatchupStartedActiveEmitter = eventEmitter.addListener(
      'gamesActiveMatchupStarted',
      (data) => {
        listenerMap.onGamesMatchupStartedActive?.(data.id);
      }
    );

    const sportsMatchupCanceledEmitter = eventEmitter.addListener(
      'sportsMatchupCanceled',
      (data) => {
        listenerMap.onSportsMatchupCanceled?.(data.id);
      }
    );

    const tournamentJoinedEmitter = eventEmitter.addListener(
      'tournamentJoined',
      (data) => {
        listenerMap.onTournamentJoined?.(data.id);
      }
    );

    return () => {
      gamesMatchupCreatedEmitter.remove();
      sportsMatchupCreatedEmitter.remove();
      gamesContextAcceptedEmitter.remove();
      sportMatchupAcceptedEmitter.remove();
      gamesMatchupCanceledEmitter.remove();
      gamesMatchupStartedEmitter.remove();
      gamesMatchupStartedActiveEmitter.remove();
      sportsMatchupCanceledEmitter.remove();
      tournamentJoinedEmitter.remove();
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
    let object = (await LucraClient.getUser()) as any;
    return object.user as LucraUser;
  },
  closeFullScreenLucraFlows: (): Promise<void> => {
    return LucraClient.closeFullScreenLucraFlows();
  },
  present: present,
  createRecreationalGame: (
    gameTypeId: string,
    atStake: object, // RewardType
    playStyle: string
  ): Promise<{
    matchupId: string;
  }> => {
    return LucraClient.createRecreationalGame(gameTypeId, atStake, playStyle);
  },
  acceptVersusRecreationalGame: (
    matchupId: string,
    teamId: string
  ): Promise<void> => {
    return LucraClient.acceptVersusRecreationalGame(matchupId, teamId);
  },
  acceptFreeForAllRecreationalGame: (matchupId: string): Promise<void> => {
    return LucraClient.acceptFreeForAllRecreationalGame(matchupId);
  },
  cancelGamesMatchup: (gameId: string): Promise<void> => {
    return LucraClient.cancelGamesMatchup(gameId);
  },
  getMatchup: async (matchupId: string): Promise<MatchupInfo> => {
    return (await LucraClient.getMatchup(matchupId)) as MatchupInfo;
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
  addLucraFlowDismissedListener: (listener: (flow: string) => void) => {
    lucraFlowDismissedCallback = listener;
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
    if (!tournamentId) {
      throw new Error('tournamentId is required');
    }
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
    | 'missingDemographicInformation'
    | 'locationError'
    | 'unknown';
} & Error;
