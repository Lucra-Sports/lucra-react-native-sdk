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
        nativeProcedure =  .ageAssuranceVerification
      default:
        throw NSError(domain: "InvalidProcedure", code: 0, userInfo: nil)
      }
  
    return nativeProcedure
  }

  static public func stringToLucraFlow(
    _ flowName: String, matchupId: String?, teamInviteId: String?, gameId: String?, verificationProcedure: String?
  ) throws -> LucraSDK.LucraFlow {
    switch flowName {
    case "profile":
      return .profile
    case "addFunds":
      return .addFunds
    case "onboarding":
      return .onboarding
    case "verifyIdentity":
      return .verifyIdentity(
        procedure: try stringToVerificationProcedure(verificationProcedure!)
      )
    case "createGamesMatchup":
      return .createGamesMatchup(gameId: gameId)
    case "createSportsMatchup":
      return .createSportsMatchup
    case "withdrawFunds":
      return .withdrawFunds
    case "publicFeed":
      return .publicFeed
    case "gameContestDetails":
      return .gamesContestDetails(matchupId: matchupId!, teamInviteId: teamInviteId!)
    case "sportContestDetails":
      return .sportsContestDetails(matchupId: matchupId!)
    case "myMatchup":
      return .myMatchups
    default:
      fatalError("Unimplemented lucra flow \(flowName)")
    }
  }
}
