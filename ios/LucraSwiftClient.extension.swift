extension LucraSwiftClient {

    enum Event: String, CaseIterable {
        case user
    }

    @objc
    static public var supportedEvents: [String] {
    return Event.allCases.map(\.rawValue);
    }
}
