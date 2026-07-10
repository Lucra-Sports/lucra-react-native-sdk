import { TurboModuleRegistry, type TurboModule } from 'react-native';

interface Spec extends TurboModule {
  initialize(options: Object): Promise<void>;

  //Lucra Flow
  present(params: Object): Promise<void>;
  closeFullScreenLucraFlows: () => Promise<void>;

  //User related
  configureUser(user: Object): Promise<void>;
  logout: () => Promise<void>;
  getUser: () => Promise<Object>;

  // All types of matchups
  getMatchup(matchupId: string): Promise<Object>;
  getMatchupDetails(matchupId: string): Promise<Object>;
  // Live matchup-details subscription — results arrive via the `matchupDetails`
  // event; cancel ends the native subscription.
  subscribeMatchupDetails(matchupId: string): void;
  cancelMatchupDetailsSubscription(): void;

  // Games related
  createRecreationalGame(
    gameTypeId: string,
    atStake: Object,
    playStyle: string
  ): Promise<{
    matchupId: string;
  }>;
  acceptVersusRecreationalGame(
    matchupId: string,
    teamId: string
  ): Promise<void>;
  acceptFreeForAllRecreationalGame(matchupId: string): Promise<void>;
  cancelGamesMatchup(matchupId: string): Promise<void>;

  // Mini Games
  preloadGeoToken: (context: string) => void;
  startMiniGame(
    gameId: string,
    gameMode: string,
    amount: number,
    matchupId: string
  ): Promise<Object>;
  getMiniGames(): Promise<Object[]>;

  // Rewards & Achievements headless (Minigames Headless epic)
  getUserTournamentRewards(params: Object): Promise<Object[]>;
  claimReward(rewardId: string): Promise<void>;
  markRewardViewed(rewardId: string): Promise<void>;
  getUserAchievements(params: Object): Promise<Object[]>;
  claimAchievement(userAchievementId: string): Promise<void>;
  markAchievementViewed(userAchievementId: string): Promise<void>;

  // Pool tournaments
  // https://docs.lucrasports.com/lucra-sdk/DPHUTeEoFi2Jw8eLoOMk/integration-documents/pool-tournaments
  getRecommendedTournaments: (params: Object) => Promise<Object[]>;
  tournamentMatchup: (tournamentId: string) => Promise<Object>;
  joinTournament: (tournamentId: string) => Promise<void>;
  autoJoinTournaments: () => Promise<string[]>;

  // Client <-> SDK listener types
  addListener: (eventType: string) => void;
  removeListeners: (count: number) => void;
  emitDeepLink: (deepLink: string) => void;
  emitCreditConversion: (creditConversion: Object) => void;
  handleLucraLink: (link: string) => Promise<boolean>;
  // Resolves a Lucra deeplink to flow info without presenting UI; null when unrecognized
  parseLucraLink: (link: string) => Promise<Object>;
  registerDeviceTokenHex: (token: string) => Promise<void>;
  registerDeviceTokenBase64: (token: string) => Promise<void>;
  registerConvertToCreditProvider: () => void;
  registerRewardProvider: () => void;
  emitAvailableRewards: (rewards: Object[]) => void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('LucraClient');
