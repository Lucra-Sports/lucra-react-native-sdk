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
    _ flowName: String, matchupId: String?, teamInviteId: String?, gameId: String?, location: String?
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
    default:
      fatalError("Unimplemented lucra flow \(flowName)")
    }
  }
}
