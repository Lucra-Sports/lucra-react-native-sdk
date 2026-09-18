extension LucraSwiftClient {
  enum Event: String, CaseIterable {
    case user
    case _deepLink
    case _creditConversion
    case gamesMatchupCreated
    case gamesMatchupAccepted
    case gamesMatchupCanceled
    case gamesMatchupStarted
    case gamesActiveMatchupStarted
    case sportsMatchupCreated
    case sportsMatchupAccepted
    case sportsMatchupCanceled
    case tournamentJoined
    case tournamentsAutoJoined
    case miniGameFinished
    case matchupDetails
    case gamesMatchupFee
    case _availableRewards
    case _claimReward
    case _viewRewards
    case lucraFlowDismissed
    case _handshakeAuthToken
    case handshakeAuthError
    case handshakeAuthInFlight
  }

  @objc
  static public var supportedEvents: [String] {
    return Event.allCases.map(\.rawValue)
  }
}
