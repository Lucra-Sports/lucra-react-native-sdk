import LucraSDK

class LucraUtils {
  static public func stringToLucraFlow(
    _ lucraFlow: String, matchupId: String?, teamInviteId: String?, gameId: String?
  ) -> LucraSDK.LucraFlow {
    switch lucraFlow {
    case "profile":
      return .profile
    case "addFunds":
      return .addFunds
    case "onboarding":
      return .onboarding
    case "verifyIdentity":
      return .verifyIdentity
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
    default:
      assertionFailure("Unimplemented lucra flow \(lucraFlow)")
      return .profile
    }
  }
}
