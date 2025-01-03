extension LucraSwiftClient {
  enum Event: String, CaseIterable {
    case user
    case _deepLink
    case _creditConversion
    case gamesContestCreated
    case gamesContestAccepted
    case sportsContestCreated
    case sportsContestAccepted
    case sportsContestCanceled
    case _availableRewards
    case _claimReward
  }

  @objc
  static public var supportedEvents: [String] {
    return Event.allCases.map(\.rawValue)
  }
}
