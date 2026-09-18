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
    /// Native asking JS for a handshake token, correlated by `requestId`.
    case _handshakeAuthToken
    /// Handshake in-flight / last error / auth-state resolution, as one payload.
    case authState
  }

  @objc
  static public var supportedEvents: [String] {
    return Event.allCases.map(\.rawValue)
  }
}
