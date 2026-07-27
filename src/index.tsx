import React from 'react';
import LucraClient from './NativeLucraClient';
export { default as LucraFlowView } from './LucraFlowViewNativeComponent';
export { MiniGameWebView } from './MiniGameWebView';
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
  type LucraReward,
  type PoolTournament,
  type LucraTournamentReward,
  type LucraAchievement,
} from './types';
import NativeLucraClient from './NativeLucraClient';
import { extractLucraDeeplink } from './pushPayload';
export { extractLucraDeeplink } from './pushPayload';
export {
  type LucraReward,
  type PoolTournament,
  type PayoutStructure,
  type PayoutReward,
  type CatalogReward,
  type LucraTournamentReward,
  type LucraCatalogReward,
  type LucraDiscountCodeConfig,
  type LucraFreeItemConfig,
  type LucraAchievement,
  type LucraAchievementDefinition,
  type LucraAchievementCriteriaType,
  type LucraAchievementCriteriaConfig,
} from './types';

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

export enum GeoComplyContext {
  FREE_BUY_IN = 'freeBuyIn',
  CASH_BUY_IN = 'cashBuyIn',
  FREE_MINIGAME = 'freeMinigame',
  CASH_MINIGAME = 'cashMinigame',
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
}

export enum MiniGameMode {
  PRACTICE = 'practice',
  ONE_VS_ONE = '1v1',
  FREE_FOR_ALL = 'free_for_all',
  TOURNAMENT = 'tournament',
}

export type StartMiniGameResult = {
  url: string;
  sessionId: string;
  matchupId?: string;
};

export type MiniGameFinishedEvent = {
  gameId?: string;
  gameMode?: MiniGameMode;
  amount?: number;
  matchupId?: string;
};

export type MiniGameCatalogConfig = {
  id: string;
  gameId: string;
  mode: string;
  wagerAmount?: number;
  groupSize?: number;
  createdAt: string;
  updatedAt: string;
};

export type MiniGameCatalogItem = {
  gameId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt: string;
  updatedAt: string;
  config: MiniGameCatalogConfig[];
};

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
  autoJoin?: boolean;
};

export type MatchupStatus =
  | 'OPEN'
  | 'CONFIRMED'
  | 'LOCKED'
  | 'CLOSED'
  | 'CLOSED_TIE'
  | 'PENDING_OUTCOMES'
  | 'DISPUTE'
  | 'CANCELED_BY_OWNER'
  | 'CANCELED_DISPUTE'
  | 'CANCELED_GAME_CANCELED'
  | 'CANCELED_NOT_ACCEPTED'
  | 'CANCELED_PLAYER_INACTIVE'
  | 'CANCELED_THROUGH_API'
  | 'CANCELED_TIMEOUT'
  | 'UNKNOWN';

export type MatchupType =
  | 'RECREATIONAL_GAME'
  | 'PROFESSIONAL_SPORTS_PLAYER_STAT'
  | 'PROFESSIONAL_SPORTS_TEAM_STAT'
  | 'POOL_TOURNAMENT'
  | 'UNKNOWN';

export type MatchupSubtype =
  | 'GROUP_VS_GROUP'
  | 'FREE_FOR_ALL'
  | 'POOL_N_WINNER'
  | 'UNKNOWN';

export type MatchupInfo = {
  id: string;
  updatedAt: string;
  createdAt: string;
  creatorId: string;
  status: MatchupStatus;
  subtype: MatchupSubtype;
  type: MatchupType;
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

export type MatchupDetails = {
  matchup: MatchupInfo;
  groups: MatchupGroupDetails[];
  participantScores: MatchupParticipantScore[];
};

export type MatchupGroupDetails = {
  id: string;
  name?: string;
  outcome: 'WIN' | 'LOSS' | 'TIE' | 'UNKNOWN';
  score?: number;
  participants: MatchupParticipantDetails[];
};

export type MatchupParticipantDetails = {
  userId: string;
  username: string;
  avatarUrl?: string;
  individualPayout?: number;
};

export type MatchupParticipantScore = {
  userId?: string;
  username?: string;
  avatarUrl?: string;
  place?: number;
  score?: number;
  finishedAt?: string;
  groupId?: string;
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
let matchupDetailsListener: NativeEventSubscription | null = null;
let matchupDetailsGeneration = 0;

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
  onAutoJoinedTournaments?: (tournamentIds: string[]) => void;
  onMiniGameFinished?: (event: MiniGameFinishedEvent) => void;
};

/**
 * Flow info resolved from a Lucra deeplink or push notification, without
 * presenting any UI. `flow` uses the same names `LucraSDK.present` accepts
 * where the flow is presentable.
 */
export type LucraFlowInfo = {
  flow: string;
  matchupId?: string;
  gameId?: string;
  location?: string;
  gameMode?: string;
  amount?: number;
  /** Android-only dynamic flow route */
  route?: string;
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
  MINI_GAME: 'miniGame',
  MINI_GAMES_HOME: 'miniGamesHome',
  MINI_GAMES_PROFILE: 'miniGamesProfile',
  MINI_GAMES_REWARDS: 'miniGamesRewards',
  MINI_GAMES_MATCHUP_DETAILS: 'miniGamesMatchupDetails',
  ACHIEVEMENTS: 'achievements',
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
  name: typeof Flows.MINI_GAME;
  gameId: string;
  gameMode: MiniGameMode;
  amount?: number;
  matchupId?: string;
}): Promise<void>;
function present(params: { name: typeof Flows.ACHIEVEMENTS }): Promise<void>;
function present(params: { name: typeof Flows.MINI_GAMES_HOME }): Promise<void>;
function present(params: {
  name: typeof Flows.MINI_GAMES_PROFILE;
}): Promise<void>;
function present(params: {
  name: typeof Flows.MINI_GAMES_REWARDS;
}): Promise<void>;
function present(params: {
  name: typeof Flows.MINI_GAMES_MATCHUP_DETAILS;
  matchupId: string;
}): Promise<void>;
function present(params: {
  name: FlowNames;
  gameId?: string;
  gameMode?: MiniGameMode;
  amount?: number;
  matchupId?: string;
  locationId?: string;
}): Promise<void> {
  try {
    return LucraClient.present(params);
  } catch (error) {
    return Promise.reject(error);
  }
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

    const tournamentsAutoJoinedEmitter = eventEmitter.addListener(
      'tournamentsAutoJoined',
      (data) => {
        listenerMap.onAutoJoinedTournaments?.(data.tournamentIds);
      }
    );

    const miniGameFinishedEmitter = eventEmitter.addListener(
      'miniGameFinished',
      (data) => {
        listenerMap.onMiniGameFinished?.(data as MiniGameFinishedEvent);
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
      tournamentsAutoJoinedEmitter.remove();
      miniGameFinishedEmitter.remove();
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
  preloadGeoToken: (context: GeoComplyContext): void => {
    LucraClient.preloadGeoToken(context);
  },
  startMiniGame: async (
    gameId: string,
    gameMode: MiniGameMode,
    amount: number = 0,
    matchupId?: string
  ): Promise<StartMiniGameResult> => {
    return (await LucraClient.startMiniGame(
      gameId,
      gameMode,
      amount,
      matchupId ?? ''
    )) as StartMiniGameResult;
  },
  // Rewards & Achievements headless (Minigames Headless epic)
  getUserTournamentRewards: async ({
    tournamentId,
    viewed,
    claimed,
  }: {
    tournamentId?: string;
    viewed?: boolean;
    claimed?: boolean;
  } = {}): Promise<LucraTournamentReward[]> => {
    return (await LucraClient.getUserTournamentRewards({
      tournamentId,
      viewed,
      claimed,
    })) as LucraTournamentReward[];
  },
  claimReward: (rewardId: string): Promise<void> => {
    return LucraClient.claimReward(rewardId);
  },
  markRewardViewed: (rewardId: string): Promise<void> => {
    return LucraClient.markRewardViewed(rewardId);
  },
  getUserAchievements: async ({
    viewed,
    claimed,
    includeNoProgress = true,
  }: {
    viewed?: boolean;
    claimed?: boolean;
    includeNoProgress?: boolean;
  } = {}): Promise<LucraAchievement[]> => {
    return (await LucraClient.getUserAchievements({
      viewed,
      claimed,
      includeNoProgress,
    })) as LucraAchievement[];
  },
  claimAchievement: (userAchievementId: string): Promise<void> => {
    return LucraClient.claimAchievement(userAchievementId);
  },
  markAchievementViewed: (userAchievementId: string): Promise<void> => {
    return LucraClient.markAchievementViewed(userAchievementId);
  },
  /** Lists every mini game enabled for the current tenant, each with the tenant's subscribed config options. */
  getMiniGames: async (): Promise<MiniGameCatalogItem[]> => {
    return (await LucraClient.getMiniGames()) as MiniGameCatalogItem[];
  },
  getMatchup: async (matchupId: string): Promise<MatchupInfo> => {
    return (await LucraClient.getMatchup(matchupId)) as MatchupInfo;
  },
  getMatchupDetails: async (matchupId: string): Promise<MatchupDetails> => {
    return (await LucraClient.getMatchupDetails(matchupId)) as MatchupDetails;
  },
  /**
   * Subscribe to live matchup detail updates (e.g. GYP scores / auto
   * settlement as a game progresses). `onResult` fires immediately with the
   * current details and again on every server-side change.
   *
   * In React components prefer the `useMatchupDetails` hook, which scopes the
   * subscription to the component lifecycle automatically.
   *
   * Returns an unsubscribe function — call it to stop receiving updates and
   * cancel the native subscription. Only one matchup-details subscription is
   * active at a time; subscribing again replaces the previous one. The
   * returned function is safe to call more than once, and a stale unsubscribe
   * never cancels a subscription that has since replaced it.
   */
  subscribeToMatchupDetails: (
    matchupId: string,
    onResult: (details: MatchupDetails) => void,
    onError?: (error: { code: string; message: string }) => void
  ): (() => void) => {
    matchupDetailsListener?.remove();
    const generation = ++matchupDetailsGeneration;
    const subscription = eventEmitter.addListener(
      'matchupDetails',
      (payload: {
        matchupId: string;
        details?: MatchupDetails;
        error?: { code: string; message: string };
      }) => {
        if (payload.matchupId !== matchupId) return;
        if (payload.error) {
          onError?.(payload.error);
        } else if (payload.details) {
          onResult(payload.details);
        }
      }
    );
    matchupDetailsListener = subscription;
    LucraClient.subscribeMatchupDetails(matchupId);
    return () => {
      subscription.remove();
      if (generation === matchupDetailsGeneration) {
        matchupDetailsListener = null;
        LucraClient.cancelMatchupDetailsSubscription();
      }
    };
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
  parseLucraLink: async (link: string): Promise<LucraFlowInfo | null> => {
    return ((await LucraClient.parseLucraLink(link)) as LucraFlowInfo) ?? null;
  },
  handleLucraNotification: async (
    payload: Record<string, unknown>
  ): Promise<LucraFlowInfo | null> => {
    const link = extractLucraDeeplink(payload);
    if (!link) {
      return null;
    }
    return ((await LucraClient.parseLucraLink(link)) as LucraFlowInfo) ?? null;
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
  tournamentMatchup: async (tournamentId: string): Promise<PoolTournament> => {
    if (!tournamentId) {
      throw new Error('tournamentId is required');
    }
    return (await LucraClient.tournamentMatchup(
      tournamentId
    )) as PoolTournament;
  },
  joinTournament: async (tournamentId: string) => {
    return await LucraClient.joinTournament(tournamentId);
  },
  autoJoinTournaments: async (): Promise<string[]> => {
    return await LucraClient.autoJoinTournaments();
  },
};

/**
 * React hook for live matchup details, scoped to the component lifecycle —
 * the React equivalent of Android's lifecycle-scoped coroutines. Subscribes
 * on mount (and whenever `matchupId` changes) and automatically cancels the
 * native subscription on unmount, so it cannot leak.
 *
 * Pass `undefined` to stay idle (e.g. while the matchup id is still loading).
 */
export function useMatchupDetails(matchupId: string | undefined): {
  details: MatchupDetails | null;
  error: { code: string; message: string } | null;
} {
  const [details, setDetails] = React.useState<MatchupDetails | null>(null);
  const [error, setError] = React.useState<{
    code: string;
    message: string;
  } | null>(null);

  React.useEffect(() => {
    if (!matchupId) {
      return;
    }
    setDetails(null);
    setError(null);
    return LucraSDK.subscribeToMatchupDetails(
      matchupId,
      (next) => {
        setError(null);
        setDetails(next);
      },
      setError
    );
  }, [matchupId]);

  return { details, error };
}

export type LucraSDKError = {
  code:
    | 'notInitialized'
    | 'unverified'
    | 'notAllowed'
    | 'insufficientFunds'
    | 'apiError'
    | 'missingDemographicInformation'
    | 'locationError'
    | 'unknownError';
} & Error;
