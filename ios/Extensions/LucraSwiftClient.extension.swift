extension LucraSwiftClient {
  enum Event: String, CaseIterable {
    case user
    case _deepLink
    case _creditConversion
    case gamesMatchupCreated
    case gamesMatchupAccepted
    case gamesMatchupCanceled
    case sportsMatchupCreated
    case sportsMatchupAccepted
    case sportsMatchupCanceled
    case _availableRewards
    case _claimReward
    case _viewRewards
    case lucraFlowDismissed
  }

  @objc
  static public var supportedEvents: [String] {
    return Event.allCases.map(\.rawValue)
  }
}
