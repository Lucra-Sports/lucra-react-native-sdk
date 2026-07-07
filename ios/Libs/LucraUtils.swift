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
    gameMode: String? = nil, amount: Decimal? = nil
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
    case "sportContestDetails":
      return .sportsContestDetails(matchupId: matchupId!)
    case "myMatchup":
      return .myMatchups
    case "wallet":
      return .wallet
    case "homePage":
      return .homePage(location: location)
    case "miniGame":
      guard let gameMode, let parsedMode = MiniGameMode(rawValue: gameMode) else {
        throw NSError(
          domain: "InvalidMiniGameFlow", code: 0,
          userInfo: [NSLocalizedDescriptionKey: "miniGame flow requires a valid gameMode"])
      }
      return .miniGame(
        gameId: gameId, gameMode: parsedMode, amount: amount, matchupId: matchupId,
        handlePostNavigation: false)
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
    default:
      fatalError("Unimplemented lucra flow \(flowName)")
    }
  }
}
