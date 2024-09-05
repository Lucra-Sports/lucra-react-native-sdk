extension LucraSwiftClient {

  enum Event: String, CaseIterable {
    case user
    case _deepLink
    case _creditConversion
    case gamesContestCreated
    case gamesContestAccepted
    case sportsContestCreated
    case sportsContestAccepted
  }

  @objc
  static public var supportedEvents: [String] {
    return Event.allCases.map(\.rawValue)
  }
}
