import LucraSDK

class LucraUtils {
  static public func stringToEnvironment(_ environment: String?) -> LucraSDK.LucraEnvironment {
    let nativeEnvironment: LucraSDK.LucraEnvironment = {
      switch environment {
      case "develop":
        return .develop
      case "staging":
        return .staging
      case "sandbox":
        return .sandbox
      case "production":
        return .production
      default:
        return .unknown
      }
    }()
    return nativeEnvironment
  }

  /// `nil` keeps the SDK's inferred appearance, which is what omitting `themeMode` means.
  static public func stringToThemeMode(_ themeMode: String?) -> LucraSDK.LucraThemeMode? {
    switch themeMode {
    case "light":
      return .light
    case "dark":
      return .dark
    case "auto":
      return .system
    default:
      return nil
    }
  }

  static public func stringToVerificationProcedure(_ procedure: String) throws
    -> LucraSDK.LucraIDVerificationProcedure
  {
    let nativeProcedure: LucraSDK.LucraIDVerificationProcedure
    switch procedure {
    case "fullKYCVerification":
      nativeProcedure = .fullKYCVerification
    case "ageAssuranceVerification":
      nativeProcedure = .ageAssuranceVerification
    default:
      throw NSError(domain: "InvalidProcedure", code: 0, userInfo: nil)
    }

    return nativeProcedure
  }

  static public func stringToLucraFlow(
    _ flowName: String, matchupId: String?, teamInviteId: String?, gameId: String?, location: String?,
    gameMode: String? = nil, amount: Decimal? = nil, handlePostNavigation: Bool = false
  ) throws -> LucraSDK.LucraFlow {
    switch flowName {
    case "profile":
      return .profile
    case "addFunds":
      return .addFunds
    case "onboarding":
      return .onboarding
    case "demographicCollection":
      return .demographicCollection
    case "verifyIdentity":
      return .verifyIdentity
    case "createGamesMatchup":
      return .createGamesMatchup(gameId: gameId, location: location)
    case "createSportsMatchup":
      return .createSportsMatchup
    case "withdrawFunds":
      return .withdrawFunds
    case "publicFeed":
      return .publicFeed
    case "gamesMatchupDetails":
      return .gamesMatchupDetails(matchupId: matchupId!)
    case "matchupDetails":
      return .matchupDetails(matchupId: matchupId!)
    case "tournamentDetails":
      guard let matchupId else {
        throw NSError(
          domain: "InvalidTournamentDetailsFlow", code: 0,
          userInfo: [NSLocalizedDescriptionKey: "tournamentDetails flow requires a matchupId"])
      }
      return .tournamentDetails(matchupId: matchupId)
    case "sportContestDetails":
      return .sportsContestDetails(matchupId: matchupId!)
    case "myMatchup":
      return .myMatchups
    case "wallet":
      return .wallet
    case "homePage":
      return .homePage(location: location)
    case "notifications":
      return .notifications
    case "transactionHistory":
      return .transactionHistory
    case "customerSupport":
      return .customerSupport
    case "responsibleGaming":
      return .responsibleGaming
    case "miniGame":
      guard let gameMode, let parsedMode = MiniGameMode(rawValue: gameMode) else {
        throw NSError(
          domain: "InvalidMiniGameFlow", code: 0,
          userInfo: [NSLocalizedDescriptionKey: "miniGame flow requires a valid gameMode"])
      }
      return .miniGame(
        gameId: gameId, gameMode: parsedMode, amount: amount, matchupId: matchupId,
        handlePostNavigation: handlePostNavigation)
    case "miniGamesHome":
      return .miniGamesHome
    case "miniGamesProfile":
      return .miniGamesProfile
    case "miniGamesRewards":
      return .miniGamesRewards
    case "miniGamesMatchupDetails":
      return .miniGamesMatchupDetails(matchupId: matchupId!)
    case "achievements":
      return .achievements
    case "handshakeTOS":
      return .handshakeTOS
    default:
      // Throwing instead of trapping: the deeplink parser hands JS flow names, so an
      // unrecognized one has to reject the promise rather than kill the host app.
      throw NSError(
        domain: "InvalidLucraFlow", code: 0,
        userInfo: [NSLocalizedDescriptionKey: "Unimplemented lucra flow \(flowName)"])
    }
  }
}
