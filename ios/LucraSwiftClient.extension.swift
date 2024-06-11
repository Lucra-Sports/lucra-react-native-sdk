extension LucraSwiftClient {

    enum Event: String, CaseIterable {
        case user
        case _deepLink
    }

    @objc
    static public var supportedEvents: [String] {
    return Event.allCases.map(\.rawValue);
    }
}
