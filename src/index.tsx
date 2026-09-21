import React from 'react';
import LucraClient from './NativeLucraClient';
export { default as LucraFlowView } from './LucraFlowViewNativeComponent';
export { MiniGameWebView } from './MiniGameWebView';
import { default as LucraProfilePillNative } from './LucraProfilePillNativeComponent';
import { default as LucraCreateContestButtonNative } from './LucraCreateContestButtonNativeComponent';
import {
  Platform,
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
  type TournamentDetails,
  type LucraTournamentReward,
  type LucraAchievement,
} from './types';
import NativeLucraClient from './NativeLucraClient';
import { extractLucraDeeplink } from './pushPayload';
export { extractLucraDeeplink } from './pushPayload';
import { formatUsPhoneNumber } from './phone';
export { formatUsPhoneNumber } from './phone';
export {
  type LucraReward,
  type PoolTournament,
  type PayoutStructure,
  type PayoutReward,
  type CatalogReward,
  type TournamentDetails,
  type TournamentDetailsHowToPlayStep,
  type TournamentDetailsEarnedReward,
  type TournamentDetailsTimer,
  type TournamentDetailsAttemptScore,
  type TournamentDetailsAttemptData,
  type TournamentDetailsLeaderboardColumn,
  type TournamentDetailsLeaderboardRow,
  type TournamentDetailsLeaderboard,
  type TournamentDetailsTerm,
  type LucraTournamentReward,
  type LucraCatalogReward,
  type LucraDiscountCodeConfig,
  type LucraFreeItemConfig,
  type LucraAchievement,
  type LucraAchievementDefinition,
  type LucraAchievementCriteriaType,
  type LucraAchievementCriteriaConfig,
} from './types';
import { normalizeTheme, type LucraTheme } from './theme';
export {
  type LucraTheme,
  type LucraColorSet,
  type LucraFontFamily,
  type LucraThemeMode,
} from './theme';

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
  theme?: LucraTheme;
  urlScheme?: string;
  merchantID?: string;
  autoJoin?: boolean;
  /**
   * When `true` (default), the SDK automatically shows its "you've won a
   * reward!" bottom sheet when the user has unclaimed rewards. Set to
   * `false` to globally suppress it. See [Reward Sheet](1.2.11_reward_sheet.md).
   */
  allowRewardSheetToDisplay?: boolean;
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
let gamesMatchupFeeListener: NativeEventSubscription | null = null;
let gamesMatchupFeeGeneration = 0;

// Handshake auth. These listeners are installed lazily and deliberately never
// removed: `init()` tears its own subscriptions down and re-adds them, and a
// token request stranded across a re-init costs the user the native SDK's full
// 5s provider timeout.
let handshakeTokenProvider: (() => Promise<string>) | null = null;
let handshakeTokenSubscription: NativeEventSubscription | null = null;
let handshakeBypassTosAgreement = false;
/** Set once `init()` resolves; gates installing the provider natively. */
let sdkInitialized = false;
/** A registration made before `init()` resolved, applied when it does. */
let pendingHandshakeRegistration = false;
let authStateSubscription: NativeEventSubscription | null = null;
let lastAuthState: LucraAuthState | null = null;
const authStateSubscribers = new Set<(state: LucraAuthState) => void>();

type LucraContestListeners = {
  onGamesMatchupCreated?: (id: string) => void;
  onSportsMatchupCreated?: (id: string) => void;
  onGamesMatchupAccepted?: (id: string) => void;
  onSportsMatchupAccepted?: (id: string) => void;
  onSportsMatchupCanceled?: (id: string) => void;
  onGamesMatchupCanceled?: (id: string) => void;
  onGamesMatchupStarted?: (id: string) => void;
  onGamesMatchupStartedActive?: (id: string) => void;
  onTournamentJoined?: (id: string, gameId?: string) => void;
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
  /**
   * Captures Terms of Service acceptance and completes a handshake sign-in.
   * Present it **only** in response to a `tosNotAccepted` handshake failure —
   * it is not a general entry point. See
   * [Handshake Authentication](1.2.12_handshake_authentication.md).
   */
  HANDSHAKE_TOS: 'handshakeTOS',
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
  /**
   * When true, on a non-Practice/non-Tournament session end with a resolved
   * matchupId, the SDK automatically navigates to the Mini Games Matchup
   * Details screen instead of dismissing. Defaults to false.
   */
  handlePostNavigation?: boolean;
}): Promise<void>;
function present(params: { name: typeof Flows.ACHIEVEMENTS }): Promise<void>;
function present(params: { name: typeof Flows.HANDSHAKE_TOS }): Promise<void>;
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
  handlePostNavigation?: boolean;
}): Promise<void> {
  try {
    return LucraClient.present(params);
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * Lift the native `recoverySuggestion` out of the rejection's `userInfo` onto
 * the error itself, so `LucraHandshakeAuthError` has one shape on both
 * platforms.
 */
function normalizeHandshakeRejection(error: any): any {
  const suggestion = error?.userInfo?.recoverySuggestion;
  if (typeof suggestion === 'string' && suggestion.length > 0) {
    error.recoverySuggestion = suggestion;
  }
  return error;
}

/**
 * Answer the native SDK's request for a handshake token.
 *
 * Correlated by `requestId`, and with a real rejection path: a JS provider that
 * throws is reported back so the native SDK surfaces `providerFailed` carrying
 * the message, rather than leaving the exchange to time out.
 *
 * Deliberately no JS timeout — the native SDKs already bound the provider at 5s
 * and cancel it, and a second timer racing theirs would turn a genuine
 * `providerTimedOut` into a misleading `providerFailed`.
 */
function ensureHandshakeTokenListener() {
  if (handshakeTokenSubscription) {
    return;
  }
  handshakeTokenSubscription = eventEmitter.addListener(
    '_handshakeAuthToken',
    async (data: { requestId: string }) => {
      const requestId = data?.requestId;
      if (!requestId) {
        return;
      }
      const provider = handshakeTokenProvider;
      if (!provider) {
        LucraClient.rejectHandshakeAuthToken(
          requestId,
          'No handshake auth token provider is registered in JavaScript.'
        );
        return;
      }
      try {
        const token = await provider();
        if (typeof token !== 'string' || token.length === 0) {
          LucraClient.rejectHandshakeAuthToken(
            requestId,
            'The handshake auth token provider returned no token.'
          );
          return;
        }
        LucraClient.resolveHandshakeAuthToken(requestId, token);
      } catch (e: any) {
        const message =
          (typeof e?.message === 'string' && e.message.trim()) ||
          String(e) ||
          'The handshake auth token provider threw.';
        LucraClient.rejectHandshakeAuthToken(requestId, message);
      }
    }
  );
}

/**
 * Cache and fan out the always-on `authState` event.
 *
 * Native starts emitting at `initialize` and never stops, so unlike the fee and
 * matchup-details subscriptions there is nothing to start or cancel — and
 * because unsubscribing is a `Set.delete`, a stale unsubscribe can never cancel
 * a subscription that replaced it.
 */
function ensureAuthStateListener() {
  if (authStateSubscription) {
    return;
  }
  authStateSubscription = eventEmitter.addListener(
    'authState',
    (state: LucraAuthState) => {
      lastAuthState = {
        isHandshakeAuthInFlight: !!state?.isHandshakeAuthInFlight,
        handshakeAuthError: state?.handshakeAuthError ?? null,
        isResolvingAuthState:
          typeof state?.isResolvingAuthState === 'boolean'
            ? state.isResolvingAuthState
            : null,
      };
      authStateSubscribers.forEach((subscriber) => subscriber(lastAuthState!));
    }
  );
}

/** Install the JS provider natively. No-op until `init()` has resolved. */
function applyHandshakeRegistration(): Promise<void> {
  if (!sdkInitialized) {
    pendingHandshakeRegistration = true;
    return Promise.resolve();
  }
  pendingHandshakeRegistration = false;
  return LucraClient.registerHandshakeAuthTokenProvider(
    handshakeTokenProvider !== null,
    handshakeBypassTosAgreement
  );
}

export const LucraSDK = {
  ready: false,
  ENVIRONMENT: LucraEnvironment,
  FLOW: Flows,
  init: async (options: LucraSDKParams): Promise<void> => {
    const theme = normalizeTheme(options.theme);
    await LucraClient.initialize(theme ? { ...options, theme } : options);
    sdkInitialized = true;
    // Installed outside the teardown/re-add block below so a re-init can never
    // strand an in-flight token request or drop the auth-state cache.
    ensureAuthStateListener();
    // Re-apply on every init, not just a staged one: Android rebuilds its SDK
    // graph on initialize, so a provider registered before a re-init would
    // otherwise be dropped natively while JS still believed it was installed.
    if (pendingHandshakeRegistration || handshakeTokenProvider) {
      await applyHandshakeRegistration();
    }
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
        listenerMap.onTournamentJoined?.(data.id, data.gameId);
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
  /**
   * Uploads a new avatar image for the current user. The native SDK scales
   * the image, uploads it, and updates the user's `avatarURL` — the `user`
   * listener emits the updated user once the upload completes.
   *
   * Accepts a local `file://` URI (e.g. from an image picker), an absolute
   * file path, or a base64 `data:` URI.
   */
  uploadUserAvatar: (imageUri: string): Promise<void> => {
    return LucraClient.uploadUserAvatar(imageUri);
  },
  /**
   * Resolves `true` when the given user has passed KYC verification.
   *
   * Android only — the iOS Lucra SDK has no headless KYC-status API yet and
   * rejects with code `unsupported`. On iOS, read `accountStatus` from
   * `LucraSDK.getUser()` for the current user instead.
   */
  getUserKycStatus: (userId: string): Promise<boolean> => {
    return LucraClient.getUserKycStatus(userId);
  },
  /**
   * Updates only the username of the current user and resolves with the
   * updated user. Rejects with `invalid_username` when the username is
   * rejected or unchanged, and `not_logged_in` when no user is configured.
   */
  updateUsername: async (username: string): Promise<LucraUser> => {
    const object = (await LucraClient.updateUsername(username)) as any;
    return object.user as LucraUser;
  },
  /**
   * Starts phone-based passwordless authentication by sending an SMS
   * verification code. Follow up with `submitVerificationCode`, and use
   * `resendCode` to re-send.
   *
   * Accepts common US formats (`5551234567`, `+1 555 123 4567`,
   * `(555) 123-4567`); the number is normalized per platform before it is
   * handed to the native SDK. Rejections use `LucraPhoneAuthError` codes.
   */
  submitPhoneNumber: (phoneNumber: string): Promise<void> => {
    return LucraClient.submitPhoneNumber(
      formatUsPhoneNumber(
        phoneNumber,
        Platform.OS === 'ios' ? 'formatted' : 'digits'
      )
    );
  },
  /**
   * Completes phone-based authentication by verifying the SMS code and
   * resolves with the authenticated user. Requires a prior successful
   * `submitPhoneNumber` call. Rejections use `LucraPhoneAuthError` codes.
   */
  submitVerificationCode: async (code: string): Promise<LucraUser> => {
    const object = (await LucraClient.submitVerificationCode(code)) as any;
    return object.user as LucraUser;
  },
  /**
   * Re-sends the SMS verification code to the phone number previously
   * submitted via `submitPhoneNumber`. Rejections use `LucraPhoneAuthError`
   * codes.
   */
  resendCode: (): Promise<void> => {
    return LucraClient.resendCode();
  },
  /**
   * Registers the async function Lucra calls to get a partner-signed handshake
   * token for the current user, so the user is signed in without Lucra's phone
   * entry screen. Pass `null` to clear it and fall back to phone auth.
   *
   * The function should call **your** backend with **your** session and return
   * the signed JWT. Lucra never sees your credentials, the token is used once
   * per call, and the native SDKs bound the call at 5 seconds. Never ship the
   * signing key in the app — that is the whole reason this is a callback.
   *
   * If your function rejects, the failure is reported as `providerFailed`
   * carrying your error's message, so a broken token endpoint is diagnosable
   * rather than looking like a timeout.
   *
   * Registering only stores the function: it signs nobody in and is safe to
   * call more than once. Calling it before `LucraSDK.init()` resolves is fine —
   * the registration is applied as soon as initialization completes.
   *
   * `bypassTosAgreement` requests that Terms of Service capture be skipped. It
   * is honored only where your tenant's configuration allows it, carries a
   * legal obligation you are taking on, and should be discussed with Lucra
   * first. See [Handshake Authentication](1.2.12_handshake_authentication.md).
   */
  registerHandshakeAuthTokenProvider: (
    provider: (() => Promise<string>) | null,
    options?: { bypassTosAgreement?: boolean }
  ): Promise<void> => {
    handshakeTokenProvider = provider;
    handshakeBypassTosAgreement = options?.bypassTosAgreement ?? false;
    if (provider) {
      ensureHandshakeTokenListener();
    }
    return applyHandshakeRegistration();
  },
  /**
   * Signs the user in with the registered handshake token provider and resolves
   * with the authenticated user. Rejects with `LucraHandshakeAuthError` codes.
   *
   * An existing session wins: if the user is already signed in — including a
   * stored session still being restored at launch — this reports that user and
   * runs no exchange, so it is safe to call unconditionally at app start. To
   * sign a different user in, call `logout()` first.
   *
   * With a provider registered you generally do not need to call this at all:
   * presenting a Lucra flow or tapping auth-gated content runs the handshake
   * itself, behind a loading state.
   *
   * Handle `tosNotAccepted` by presenting `LucraSDK.FLOW.HANDSHAKE_TOS` — it is
   * the one failure that must **not** fall back to phone auth, which cannot
   * create the account either. The flow captures the agreement and resubmits
   * the sign-in itself, so watch the `user` listener rather than this promise.
   */
  signInWithHandshakeAuth: async (): Promise<LucraUser> => {
    try {
      const object = (await LucraClient.signInWithHandshakeAuth()) as any;
      return object.user as LucraUser;
    } catch (e) {
      throw normalizeHandshakeRejection(e);
    }
  },
  /**
   * Reads the current auth state once. Prefer `subscribeToAuthState` —
   * `isResolvingAuthState` in particular is `true` for a window right after
   * init and can flip back mid-session, so a single read is easy to misread.
   */
  getAuthState: async (): Promise<LucraAuthState> => {
    const state = (await LucraClient.getAuthState()) as LucraAuthState;
    lastAuthState = state;
    return state;
  },
  /**
   * Subscribes to auth state. `onChange` fires immediately with the last known
   * state when one is cached, and again on every change.
   *
   * Returns an unsubscribe function. Unlike the other subscription helpers this
   * one supports any number of concurrent subscribers, and a stale unsubscribe
   * never cancels a subscription that replaced it.
   */
  subscribeToAuthState: (
    onChange: (state: LucraAuthState) => void
  ): (() => void) => {
    ensureAuthStateListener();
    authStateSubscribers.add(onChange);
    if (lastAuthState) {
      onChange(lastAuthState);
    }
    return () => {
      authStateSubscribers.delete(onChange);
    };
  },
  /**
   * Records a diagnostic through the native Lucra SDK's own telemetry, the
   * same logger fan-out the SDK's code reports through. `info` and `warning`
   * record breadcrumbs that attach to the next error event; `error` records a
   * non-fatal error event, which creates a Sentry issue and triggers alerts.
   * Nothing reaches your own Sentry project: records go to Lucra's SDK Sentry
   * project for the platform, using the DSN compiled into the native SDK.
   *
   * iOS tags the record with `category`; Android has no category field, so
   * the category is prefixed to the message as `[category] message`.
   */
  logTelemetry: ({
    level,
    message,
    category = 'Lucra',
  }: {
    level: LucraTelemetryLevel;
    message: string;
    category?: string;
  }): Promise<void> => {
    if (!message.trim()) {
      throw new Error('message is required');
    }
    return LucraClient.logTelemetry(level, message, category);
  },
  closeFullScreenLucraFlows: (): Promise<void> => {
    return LucraClient.closeFullScreenLucraFlows();
  },
  present: present,
  createRecreationalGame: (
    gameTypeId: string,
    atStake: object, // RewardType
    playStyle: string,
    minigameEnabled: boolean = false
  ): Promise<{
    matchupId: string;
  }> => {
    return LucraClient.createRecreationalGame(
      gameTypeId,
      atStake,
      playStyle,
      minigameEnabled
    );
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
  /**
   * Resolves the platform service fee applied to games matchups
   * (e.g. `0.05` = 5%). The fee comes from remote configuration, so prefer
   * reading it at point-of-use (or via `subscribeToGamesMatchupFee`) rather
   * than caching an early read.
   */
  getGamesMatchupFee: (): Promise<number> => {
    return LucraClient.getGamesMatchupFee();
  },
  /**
   * Subscribes to the games matchup service fee. `onChange` fires immediately
   * with the current fee and again whenever it changes.
   *
   * On iOS the native SDK exposes no fee observation yet, so the bridge polls
   * for changes; updates still arrive, just not instantaneously.
   *
   * Returns an unsubscribe function. Only one fee subscription is active at a
   * time; subscribing again replaces the previous one. The returned function
   * is safe to call more than once, and a stale unsubscribe never cancels a
   * subscription that has since replaced it.
   */
  subscribeToGamesMatchupFee: (
    onChange: (fee: number) => void,
    onError?: (error: { code: string; message: string }) => void
  ): (() => void) => {
    gamesMatchupFeeListener?.remove();
    const generation = ++gamesMatchupFeeGeneration;
    const subscription = eventEmitter.addListener(
      'gamesMatchupFee',
      (payload: {
        fee?: number;
        error?: { code: string; message: string };
      }) => {
        if (payload.error) {
          onError?.(payload.error);
        } else if (typeof payload.fee === 'number') {
          onChange(payload.fee);
        }
      }
    );
    gamesMatchupFeeListener = subscription;
    LucraClient.subscribeGamesMatchupFee();
    let disposed = false;
    return () => {
      if (disposed) {
        return;
      }
      disposed = true;
      subscription.remove();
      if (generation === gamesMatchupFeeGeneration) {
        gamesMatchupFeeListener = null;
        LucraClient.cancelGamesMatchupFeeSubscription();
      }
    };
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
  /**
   * Fetches the tournaments Lucra recommends for the current user.
   *
   * `includePrivateViewable` also returns private tournaments that are viewable
   * without a join code — a code is still required to *join* them, so check
   * `isPrivate` on each result before offering a one-tap join.
   *
   * On Android the flag, `isPrivate`, and `totalParticipants` require Lucra
   * Android SDK 7.0.1 or newer. Older Android SDKs ignore the flag and leave
   * both fields undefined.
   */
  getRecomendedTournaments: async ({
    includeClosed = true,
    limit = 50,
    includePrivateViewable = false,
  }: {
    includeClosed?: boolean;
    limit?: number;
    includePrivateViewable?: boolean;
  }): Promise<PoolTournament[]> => {
    return (await LucraClient.getRecommendedTournaments({
      includeClosed,
      limit,
      includePrivateViewableTournaments: includePrivateViewable,
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
  /**
   * Fetches the lightweight tournament details backed by the
   * `ui_tournament_details` API — the same response that powers Lucra's
   * in-app tournament details screen (leaderboard, payout structure, attempt
   * data, how-to-play steps). Prefer this over `tournamentMatchup` for
   * headless tournament UIs; the native SDKs deprecate the heavier call.
   *
   * `leaderboardLimit`/`leaderboardOffset` page the leaderboard section on
   * both platforms; omit them for the native SDK's default first page.
   */
  getTournamentDetails: async (
    tournamentId: string,
    options: { leaderboardLimit?: number; leaderboardOffset?: number } = {}
  ): Promise<TournamentDetails> => {
    if (!tournamentId) {
      throw new Error('tournamentId is required');
    }
    return (await LucraClient.getTournamentDetails(
      tournamentId,
      options
    )) as TournamentDetails;
  },
  joinTournament: async (tournamentId: string) => {
    return await LucraClient.joinTournament(tournamentId);
  },
  autoJoinTournaments: async (): Promise<string[]> => {
    return await LucraClient.autoJoinTournaments();
  },
  /**
   * Submits the user's score for a tournament and resolves with the updated
   * tournament, or `null` when the native SDK returns none (iOS).
   */
  submitUserScore: async ({
    tournamentId,
    score,
    isFinal,
    metadata = {},
  }: {
    tournamentId: string;
    score: number;
    isFinal: boolean;
    metadata?: Record<string, string>;
  }): Promise<PoolTournament | null> => {
    if (!tournamentId) {
      throw new Error('tournamentId is required');
    }
    if (!Number.isFinite(score)) {
      throw new Error('score must be a finite number');
    }
    return (
      ((await LucraClient.submitUserScore(
        score,
        tournamentId,
        metadata,
        isFinal
      )) as PoolTournament) ?? null
    );
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
/**
 * Subscribes to Lucra's auth state for the lifetime of a component.
 *
 * Returns `isHandshakeAuthInFlight` (show your own spinner while a handshake
 * runs), the last `handshakeAuthError`, and `isResolvingAuthState` — which is
 * `null` on Android, so a falsy check does the right thing on both platforms
 * without a `Platform.OS` branch.
 */
export function useAuthState(): LucraAuthState {
  const [state, setState] = React.useState<LucraAuthState>(
    () =>
      lastAuthState ?? {
        isHandshakeAuthInFlight: false,
        handshakeAuthError: null,
        isResolvingAuthState: null,
      }
  );

  React.useEffect(() => {
    return LucraSDK.subscribeToAuthState(setState);
  }, []);

  return state;
}

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
    | 'unknownError'
    /** Android-only: the feature isn't enabled for this tenant (tournament calls). */
    | 'featureDisabled'
    /** The function has no native implementation on this platform (e.g. `getUserKycStatus` on iOS). */
    | 'unsupported'
    /** `uploadUserAvatar`: the provided uri could not be decoded into an image. */
    | 'invalidImage'
    /** iOS-only `submitUserScore` backstop for a non-finite score. */
    | 'invalidScore';
} & Error;

/**
 * Severity for `logTelemetry`: `info` and `warning` are breadcrumbs, `error`
 * is a non-fatal error event.
 */
export type LucraTelemetryLevel = 'info' | 'warning' | 'error';

/**
 * Rejection shape for the phone-auth headless flow (`submitPhoneNumber`,
 * `submitVerificationCode`, `resendCode`).
 */
/**
 * Rejection shape for the handshake-auth calls (`signInWithHandshakeAuth`,
 * `registerHandshakeAuthTokenProvider`), and the `code` carried by
 * `LucraAuthState.handshakeAuthError`.
 *
 * Every failure except `tosNotAccepted` is a fallback case: fall back to phone
 * auth rather than dead-ending the user. `tosNotAccepted` is the one phone auth
 * cannot fix — present `LucraSDK.FLOW.HANDSHAKE_TOS` instead.
 */
export type LucraHandshakeAuthErrorCode =
  /** `signInWithHandshakeAuth` was called with no provider registered. */
  | 'noProviderRegistered'
  /** Your provider did not return within the native SDK's 5s budget. */
  | 'providerTimedOut'
  /** Your provider rejected; `message` carries its error message. */
  | 'providerFailed'
  /** Lucra rejected the token. Check the signing key, `iat` freshness and the claim shape. */
  | 'exchangeFailed'
  /** SDK initialization never produced a tenant — check your API key. */
  | 'tenantIdUnavailable'
  /**
   * The user is new to Lucra and has not accepted the Terms of Service. Present
   * `LucraSDK.FLOW.HANDSHAKE_TOS`, which captures the agreement and resubmits
   * the sign-in itself. Do **not** fall back to phone auth — it cannot create
   * the account either.
   */
  | 'tosNotAccepted'
  /** Android only: the session landed but the profile did not. Retryable. */
  | 'profileTimedOut'
  /** `LucraSDK.init()` has not resolved yet. */
  | 'notInitialized'
  | 'unknownError';

export type LucraHandshakeAuthError = {
  code: LucraHandshakeAuthErrorCode;
  /** The native SDK's recovery suggestion — what to actually go look at. */
  recoverySuggestion?: string;
} & Error;

/**
 * Auth state published by the native SDK, delivered by
 * `LucraSDK.subscribeToAuthState` / `LucraSDK.getAuthState` / `useAuthState`.
 */
export type LucraAuthState = {
  /** True while a handshake token exchange is running. */
  isHandshakeAuthInFlight: boolean;
  /**
   * The **last** handshake failure, cleared when the next exchange starts — not
   * an assertion that something is failing right now. Because handshake
   * failures fall back to phone auth silently, this is how a working fallback
   * is told apart from a broken integration.
   */
  handshakeAuthError: {
    code: LucraHandshakeAuthErrorCode;
    message: string;
    recoverySuggestion?: string;
  } | null;
  /**
   * True while the SDK is still resolving auth state. Can flip back to `true`
   * mid-session during a sign-in, so prefer subscribing over a one-shot read.
   *
   * **iOS only** — `null` on Android, whose SDK exposes no public equivalent.
   */
  isResolvingAuthState: boolean | null;
};

export type LucraPhoneAuthError = {
  code:
    | 'notInitialized'
    | 'invalidPhoneNumber'
    | 'phoneNumberNotSubmitted'
    | 'invalidCode'
    | 'alreadyLoggedIn'
    /** The user texted STOP to Lucra's verification sender; codes cannot be delivered until they reply START or UNSTOP. */
    | 'messagingDisabled'
    /** The SMS provider could not deliver the verification text to this number. */
    | 'smsNotDelivered'
    /** Too many send or verify attempts; the user must wait before retrying. */
    | 'tooManyAttempts'
    | 'networkError'
    | 'unknownError';
} & Error;
