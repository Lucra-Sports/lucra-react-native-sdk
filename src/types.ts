type SportsInterval = {
  interval: string;
  displayName: string;
};

type LucraSport = {
  id: string;
  name: string;
  iconUrl: string;
  priority: number;
  leagues: LucraLeague[];
  intervals: SportsInterval[];
};

type LucraLeague = {
  id: string;
  name: string;
  logoUrl: string;
  priority: number;
  schedules?: LucraSchedule[];
};

type LucraPlayerStat = {
  metricId: string;
  value: any;
};

type LucraPlayer = {
  id: string;
  firstName: string;
  lastName: string;
  headshotUrl?: string;
  lucraPosition: string;
  position: string;
  positionAbbreviation: string;
  status: string;
  isAvailable: boolean;
  sport: LucraSport;
  positionMetrics?: LucraMetric[];
  projectedStats?: LucraPlayerStat[];
  seasonAvgStats?: LucraPlayerStat[];
  liveGameStats?: LucraPlayerStat[];
  team?: LucraTeam;
  league?: LucraLeague;
  ranking?: any;
  schedule?: LucraSchedule;
};

type LucraTeam = {
  id: string;
  fullName: string;
  name: string;
  sport: LucraSport;
  abbreviation: string;
};

type LucraSchedule = {
  id: string;
  date: string;
  channel?: string;
  status: string;
  homeTeam?: LucraTeam;
  awayTeam?: LucraTeam;
  players?: LucraPlayer[];
  venue: string;
  roundName?: string;
  statusDescription?: string;
  homeScore?: any;
  awayScore?: any;
  sport: string;
  projectionsPending?: any;
};

type LucraMetric = {
  id: string;
  displayName: string;
  pluralDisplayName?: string;
  shortName: string;
  maxValue: number;
  active: boolean;
  comparisonType: string;
};

type LucraUser = {
  id: string;
  socialConnectionId?: any;
  username: string;
  avatarUrl?: string;
  loyaltyPoints: number;
};

type ProfessionalTeamStatDetails = {
  metric: LucraMetric;
  metricValue: number;
  spread: number;
  team: LucraTeam;
  schedule: LucraSchedule;
};

type ProfessionalPlayerStatDetails = {
  metric: LucraMetric;
  metricValue: number;
  spread: number;
  player: LucraPlayer;
  schedule: LucraSchedule;
};

type Participant = {
  user: LucraUser;
  reward?: LucraReward;
};

type ParticipantGroup = {
  id: string;
  outcome: string;
  professionalTeamStatDetails?: ProfessionalTeamStatDetails;
  professionalPlayerStatDetails?: ProfessionalPlayerStatDetails;
  participants: Participant[];
};

export type LucraReward = {
  rewardId: string;
  title: string;
  descriptor: string;
  iconUrl: string;
  bannerIconUrl: string;
  disclaimer: string;
  metadata: string | null;
};

type PoolTournamentParticipant = {
  id: string;
  username: string;
  place?: number;
  rewardValue?: number;
};

export type PoolTournament = {
  id: string;
  title: string;
  type: string;
  fee: number;
  buyInAmount: number;
  description?: string;
  participants: PoolTournamentParticipant[];
  status: string;
  metadata?: string;
  iconUrl?: string;
  expiresAt?: string;
  potTotal: number;
  // Reward structure (native iOS 5.5.0 / Android 6.6.0+). Additive — present
  // when the backend supplies it. `rewardType` is the raw API category
  // ("POOL_CASH_REWARD" | "POOL_TENANT_REWARD").
  rewardType?: string;
  payoutStructure?: PayoutStructure;
  /**
   * True when a join code is required to enter — the tournament is visible but
   */
  isPrivate?: boolean;
  /**
   * The tournament's true entrant count. Prefer this over `participants.length`,
   */
  totalParticipants?: number;
};

export type PayoutStructure = {
  title: string;
  description: string;
  labelTitle?: string;
  labelDescription?: string;
  noPayout: boolean;
  isPercentagePayout: boolean;
  showAmount: boolean;
  jackpotAmount?: string;
  jackpotDescriptor?: string;
  rewards: PayoutReward[];
};

export type PayoutReward = {
  place?: number;
  /** End position for tie ranges; equals `place` for a single position. */
  endPlace?: number;
  /** Pre-formatted place label, e.g. "1st", "4th–10th". */
  placeLabel?: string;
  /** Pre-formatted position label, e.g. "1st Place". */
  positionLabel?: string;
  /** Pre-formatted reward descriptor, e.g. "40%" or "Grand Prize". */
  rewardLabel?: string;
  /** Pre-formatted payout amount, e.g. "$1,000". */
  amountLabel?: string;
  /** Raw numeric reward value. */
  value?: number;
  /** Tangible reward details. Present only on reward-based (non-cash) rows. */
  catalogReward?: CatalogReward;
};

/**
 * Tangible reward item attached to a payout row. Intentionally excludes
 * redemption details (discount codes, claim URLs, free-item IDs) — use
 * `getUserTournamentRewards` for a claimed reward's redemption payload.
 */
export type CatalogReward = {
  id: string;
  type: string;
  title: string;
  description?: string;
  iconUrl?: string;
  bannerIconUrl?: string;
  disclaimer?: string;
};

export type TournamentDetailsHowToPlayStep = {
  step: number;
  text: string;
};

export type TournamentDetailsEarnedReward = {
  id: string;
  place: number;
  /**
   * Tangible reward details. Intentionally excludes redemption details —
   * use `getUserTournamentRewards` for a claimed reward's redemption payload.
   */
  reward?: CatalogReward;
};

export type TournamentDetailsTimer = {
  /** Pre-formatted countdown caption, e.g. "Ends in 2h 15m". */
  caption: string;
  state: 'NOT_STARTED' | 'STARTED' | 'ENDED';
};

export type TournamentDetailsAttemptScore = {
  attempt: number;
  score?: string;
  isBest?: boolean;
};

export type TournamentDetailsAttemptData = {
  canJoinTournament: boolean;
  isReplayable: boolean;
  isUserPresent?: boolean;
  attemptsRemaining?: number;
  /** Rank change since the previous attempt. */
  rankVariation?: number;
  presentToUser?: boolean;
  modalTitleText?: string;
  playAgainRecommendationTitle?: string;
  playAgainRecommendationText?: string;
  /** iOS only. */
  remainingAttemptsText?: string;
  iconType?: string;
  scores: TournamentDetailsAttemptScore[];
};

export type TournamentDetailsLeaderboardColumn = {
  name?: string;
  label?: string;
};

export type TournamentDetailsLeaderboardRow = {
  userId: string;
  name: string;
  rank?: number;
  /** Pre-formatted points/score label. */
  points?: string;
  /** Pre-formatted payout label. */
  payout?: string;
};

export type TournamentDetailsLeaderboard = {
  columns: TournamentDetailsLeaderboardColumn[];
  rows: TournamentDetailsLeaderboardRow[];
  pagination: {
    totalCount: number;
    offset: number;
    limit: number;
  };
};

export type TournamentDetailsTerm = {
  title: string;
  description: string;
};

/**
 * Lightweight tournament details payload backed by the `ui_tournament_details`
 * API — the same response that powers Lucra's in-app tournament details
 * screen. Headless counterpart of the heavier `tournamentMatchup` response.
 * Fields marked platform-only are absent on the other platform.
 */
export type TournamentDetails = {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  isPrivate: boolean;
  isCompleted: boolean;
  isNotStarted: boolean;
  isExpired: boolean;
  freeBuyIn: boolean;
  buyInAmount?: number;
  /** Android only. */
  status?: string;
  /** Android only: 'PUBLIC' | 'PRIVATE_VIEWABLE' | 'PRIVATE_HIDDEN'. */
  visibilityLevel?: string;
  maxParticipants?: number;
  totalParticipants?: number;
  /** Raw API reward category, e.g. "POOL_CASH_REWARD" | "POOL_TENANT_REWARD". */
  rewardType?: string;
  gameId?: string;
  minigameEnabled?: boolean;
  howToPlay: TournamentDetailsHowToPlayStep[];
  earnedRewards: TournamentDetailsEarnedReward[];
  timer?: TournamentDetailsTimer;
  attemptData?: TournamentDetailsAttemptData;
  payoutStructure?: PayoutStructure;
  leaderboard?: TournamentDetailsLeaderboard;
  /** The current user's row, when they participate in the tournament. */
  userLeaderboardRow?: TournamentDetailsLeaderboardRow;
  terms: TournamentDetailsTerm[];
  /** ISO 8601. */
  expiresAt?: string;
  /** ISO 8601. */
  startsAt?: string;
};

export type SportsMatchupType = {
  id: string;
  status: string;
  subType: string;
  participantGroups: ParticipantGroup[];
};

// ────────────────────────────────────────────────────────────────────────────
// Minigames Headless epic — Rewards & Achievements
// Shapes are normalized so iOS and Android map to the same JS structure.
// ────────────────────────────────────────────────────────────────────────────

export type LucraDiscountCodeConfig = {
  code?: string;
  claimUrl?: string;
};

export type LucraFreeItemConfig = {
  itemId?: string;
};

// Catalog reward backing a tournament/minigame reward or an achievement.
// iOS: RewardItem / Android: LucraCatalogReward
export type LucraCatalogReward = {
  id: string;
  type?: string;
  title: string;
  descriptor?: string;
  iconUrl?: string;
  bannerIconUrl?: string;
  disclaimer?: string;
  discountCode?: LucraDiscountCodeConfig;
  freeItem?: LucraFreeItemConfig;
};

// A non-monetary reward earned for a tournament or minigame matchup.
// iOS: EarnedReward / Android: LucraTournamentReward
export type LucraTournamentReward = {
  id: string;
  place: number;
  matchupId?: string;
  matchupTitle?: string;
  claimedAt?: string;
  viewedAt?: string;
  reward?: LucraCatalogReward;
};

export type LucraAchievementCriteriaType =
  | 'scoreThreshold'
  | 'winCount'
  | 'placementCount'
  | 'participationCount';

export type LucraAchievementCriteriaConfig = {
  threshold?: number;
  conditionOperator?: 'gte' | 'lte' | 'eq';
  count?: number;
  place?: number;
};

// Achievement definition / metadata.
// iOS: AchievementItem / Android: LucraAchievementDefinition
export type LucraAchievementDefinition = {
  id: string;
  title: string;
  description?: string;
  iconUrl?: string;
  criteriaType: LucraAchievementCriteriaType;
  criteriaConfig: LucraAchievementCriteriaConfig;
  gameId?: string;
  catalogReward?: LucraCatalogReward;
};

// A user's progress/state for an achievement.
// iOS: UserAchievement / Android: LucraAchievement
export type LucraAchievement = {
  id: string;
  userId: string;
  achievementId: string;
  tenantId: string;
  matchupId?: string;
  userGameScoreId?: string;
  isEarned: boolean;
  earnedAt?: string;
  viewedAt?: string;
  claimedAt?: string;
  currentProgress: number;
  achievement?: LucraAchievementDefinition;
};
