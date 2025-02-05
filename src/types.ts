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
