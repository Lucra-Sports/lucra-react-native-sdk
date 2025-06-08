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

  // Pool tournaments
  // https://docs.lucrasports.com/lucra-sdk/DPHUTeEoFi2Jw8eLoOMk/integration-documents/pool-tournaments
  getRecommendedTournaments: (params: Object) => Promise<Object[]>;
  tournamentMatchup: (tournamentId: string) => Promise<Object>;
  joinTournament: (tournamentId: string) => Promise<void>;

  // Client <-> SDK listener types
  addListener: (eventType: string) => void;
  removeListeners: (count: number) => void;
  emitDeepLink: (deepLink: string) => void;
  emitCreditConversion: (creditConversion: Object) => void;
  handleLucraLink: (link: string) => Promise<boolean>;
  registerDeviceTokenHex: (token: string) => Promise<void>;
  registerDeviceTokenBase64: (token: string) => Promise<void>;
  registerConvertToCreditProvider: () => void;
  registerRewardProvider: () => void;
  emitAvailableRewards: (rewards: Object[]) => void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('LucraClient');
