import { TurboModuleRegistry, TurboModule } from 'react-native';

interface Spec extends TurboModule {
  initialize(options: Object): Promise<void>;
  present(flow: string): void;
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
  registerUserCallback(cb: (userData: Object) => void): void;
  logout: () => Promise<void>;
  getUser: () => Promise<Object>;
  // event emitter
  addListener: (eventType: string) => void;
  removeListeners: (count: number) => void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('LucraClient');
