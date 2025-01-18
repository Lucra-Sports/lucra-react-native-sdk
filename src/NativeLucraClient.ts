import { TurboModuleRegistry, type TurboModule } from 'react-native';

interface Spec extends TurboModule {
  initialize(options: Object): Promise<void>;
  present(params: Object): Promise<void>;
  createGamesMatchup(
    gameTypeId: string,
    wagerAmount: number
  ): Promise<{
    matchupId: string;
    ownerTeamId: string;
    opponentTeamId: string;
  }>;
  acceptGamesMatchup(matchupId: string, teamId: string): Promise<void>;
  cancelGamesMatchup(matchupId: string): Promise<void>;
  getGamesMatchup(matchupId: string): Promise<Object>;
  configureUser(user: Object): Promise<void>;
  logout: () => Promise<void>;
  getUser: () => Promise<Object>;
  // event emitter
  addListener: (eventType: string) => void;
  removeListeners: (count: number) => void;
  emitDeepLink: (deepLink: string) => void;
  emitCreditConversion: (creditConversion: Object) => void;
  handleLucraLink: (link: string) => Promise<boolean>;
  registerDeviceTokenHex: (token: string) => Promise<void>;
  registerDeviceTokenBase64: (token: string) => Promise<void>;
  getSportsMatchup(contestId: string): Promise<Object>;
  registerConvertToCreditProvider: () => void;
  registerRewardProvider: () => void;
  emitAvailableRewards: (rewards: Object[]) => void;
  // Pool tournaments
  // https://docs.lucrasports.com/lucra-sdk/DPHUTeEoFi2Jw8eLoOMk/integration-documents/pool-tournaments
  getRecommendedTournaments: (params: Object) => Promise<Object[]>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('LucraClient');
