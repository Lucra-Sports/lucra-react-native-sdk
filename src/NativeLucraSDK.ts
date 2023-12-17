import { TurboModuleRegistry, type TurboModule } from 'react-native';

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
    adressCont?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
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
};

export interface Spec extends TurboModule {
  initialize(options: {
    authenticationClientId: string;
    environment: string;
    theme?: {
      background?: string;
      surface?: string;
      primary?: string;
      secondary?: string;
      tertiary?: string;
      onBackground?: string;
      onSurface?: string;
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
    merchantID?: string;
  }): Promise<void>;
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
  configureUser(user: LucraUserConfig): void;
  registerUserCallback(cb: (userData: LucraUser) => void): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('LucraClient');
