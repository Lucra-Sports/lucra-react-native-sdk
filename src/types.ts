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
