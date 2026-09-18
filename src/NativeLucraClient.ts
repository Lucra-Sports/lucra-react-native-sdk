import { TurboModuleRegistry, type TurboModule } from 'react-native';

export interface Spec extends TurboModule {
  initialize(options: Object): Promise<void>;

  //Lucra Flow
  present(params: Object): Promise<void>;
  closeFullScreenLucraFlows: () => Promise<void>;

  //User related
  configureUser(user: Object): Promise<void>;
  logout: () => Promise<void>;
  getUser: () => Promise<Object>;
  uploadUserAvatar(imageUri: string): Promise<void>;
  // Android only — the iOS SDK has no headless KYC-status API yet and rejects
  // with code `unsupported`.
  getUserKycStatus(userId: string): Promise<boolean>;
  updateUsername(username: string): Promise<Object>;

  // Phone-auth headless flow
  submitPhoneNumber(phoneNumber: string): Promise<void>;
  submitVerificationCode(code: string): Promise<Object>;
  resendCode(): Promise<void>;

  // Handshake auth. The provider lives in JS, so the native token request goes
  // out as a `_handshakeAuthToken` event carrying a requestId and comes back
  // through `emitHandshakeAuthToken`. Failures and in-flight state arrive via
  // the `handshakeAuthError` / `handshakeAuthInFlight` events.
  registerHandshakeAuthTokenProvider(options: Object): void;
  emitHandshakeAuthToken(response: Object): void;
  // Resolves { user } once the profile has loaded; null when there is none.
  signInWithHandshakeAuth(): Promise<Object>;

  // Records a breadcrumb or non-fatal error through the native SDK's own
  // telemetry fan-out (Lucra's SDK Sentry project for the platform).
  logTelemetry(level: string, message: string, category: string): Promise<void>;

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
    playStyle: string,
    minigameEnabled: boolean
  ): Promise<{
    matchupId: string;
  }>;
  acceptVersusRecreationalGame(
    matchupId: string,
    teamId: string
  ): Promise<void>;
  acceptFreeForAllRecreationalGame(matchupId: string): Promise<void>;
  cancelGamesMatchup(matchupId: string): Promise<void>;

  // Games matchup service fee. Live updates arrive via the `gamesMatchupFee`
  // event; cancel ends the native subscription.
  getGamesMatchupFee(): Promise<number>;
  subscribeGamesMatchupFee(): void;
  cancelGamesMatchupFeeSubscription(): void;

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
  // Lightweight ui_tournament_details payload; params carries the optional
  // leaderboard pagination options.
  getTournamentDetails(tournamentId: string, params: Object): Promise<Object>;
  joinTournament: (tournamentId: string) => Promise<void>;
  autoJoinTournaments: () => Promise<string[]>;
  // Resolves null when the native SDK returns no updated tournament (iOS)
  submitUserScore(
    score: number,
    tournamentId: string,
    metadata: Object,
    isFinal: boolean
  ): Promise<Object>;

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

export default TurboModuleRegistry.getEnforcing<Spec>('NativeLucraClient');
