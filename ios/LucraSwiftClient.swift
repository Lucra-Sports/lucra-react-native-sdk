import Combine
import LucraSDK

@objc public protocol LucraClientDelegate {
  func sendEvent(name: String, result: [String: Any])
}

@objc public class LucraSwiftClient: NSObject, LucraFlowListener {
  @objc weak public var delegate: LucraClientDelegate? = nil
  private var nativeClient: LucraSDK.LucraClient!
  private var userCallback: RCTResponseSenderBlock?
  private var userSinkCancellable: AnyCancellable?
  private var eventSinkCancellable: AnyCancellable?
  private let deepLinkEmitter = PassthroughSubject<String, Never>()
  public let creditConversionEmitter = PassthroughSubject<
    [String: Any], Never
  >()
  public let rewardEmitter = PassthroughSubject<[[String: Any]], Never>()
  private var rewardProvider: RewardProvider!
  private var conversionProvider: ConversionProvider!

  static public var shared = LucraSwiftClient()

  @objc static public func getShared() -> LucraSwiftClient {
    return shared
  }

  @objc public func initialize(
    _ options: [String: Any],
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    // Client has already been initialized
    guard nativeClient == nil else {
      resolve(nil)
      return
    }

    guard let apiURL = options["apiURL"] as? String
    else {
      reject(
        "PARAM_ERROR",
        "no apiURL passed to LucraSDK constructor",
        nil
      )
      return
    }
    guard let apiKey = options["apiKey"] as? String
    else {
      reject(
        "PARAM_ERROR",
        "no apiKey passed to LucraSDK constructor",
        nil
      )
      return
    }

    let merchantID = options["merchantID"] as? String
    let urlScheme = options["urlScheme"] as? String ?? ""

    var clientTheme = ClientTheme()

    if let theme = options["theme"] as? [String: Any] {
      clientTheme = mapToClientTheme(theme: theme)
    }

    let environment = LucraUtils.stringToEnvironment(
      options["environment"] as? String)

    nativeClient = LucraSDK.LucraClient(
      config: .init(
        environment: .init(
          apiURL: apiURL,
          apiKey: apiKey,
          environment: environment,
          urlScheme: urlScheme,
          merchantID: merchantID
        ),
        appearance: clientTheme
      )
    )

    eventSinkCancellable = nativeClient.$event.sink { event in
      guard let event = event else { return }

      switch event {
      case .gamesMatchupCreated(let id):
        self.delegate?.sendEvent(
          name: "gamesMatchupCreated", result: ["id": id])
      case .gamesMatchupAccepted(let id):
        self.delegate?.sendEvent(
          name: "gamesMatchupAccepted", result: ["id": id])
      case .gamesMatchupCanceled(let id):
        self.delegate?.sendEvent(
          name: "gamesMatchupCanceled", result: ["id": id])
      case .sportsMatchupCreated(let id):
        self.delegate?.sendEvent(
          name: "sportsMatchupCreated", result: ["id": id])
      case .sportsMatchupAccepted(let id):
        self.delegate?.sendEvent(
          name: "sportsMatchupAccepted", result: ["id": id])
      case .sportsMatchupCanceled(let id):
        self.delegate?.sendEvent(
          name: "sportsMatchupCanceled", result: ["id": id])
      @unknown default:
        fatalError()
      }
    }

    nativeClient.lucraFlowListener = self
      
    userSinkCancellable = nativeClient.$user.sink { user in
      guard let user = user else {
        self.delegate?.sendEvent(name: "user", result: ["user": nil])
        return
      }

      self.delegate?.sendEvent(name: "user", result: sdkUserToMap(user: user))
    }

    nativeClient.registerDeeplinkProvider { lucraDeepLink in
      var cancellable: AnyCancellable?
      let deeplink = await withCheckedContinuation { [weak self] continuation in
        guard let self else { return }

        cancellable = deepLinkEmitter.sink { value in
          continuation.resume(returning: value)
          cancellable?.cancel()
          cancellable = nil
        }
        self.delegate?.sendEvent(
          name: "_deepLink", result: ["link": lucraDeepLink])

      }
      return deeplink
    }

    resolve(nil)
  }

   public func flowDismissed(onFlowDismissRequested: LucraFlow) {
        
        self.delegate?.sendEvent(name: "lucraFlowDismissed", result: [
            "lucraFlow" : onFlowDismissRequested.displayName
        ])
    }
    
  @objc public func configureUser(
    _ user: [String: Any], resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    let sdkUser: SDKUser = mapToSDKUser(user: user)

    Task {
      do {
        try await nativeClient.configure(user: sdkUser)
        resolve(nil)
      } catch {
        ErrorMapper.reject(reject, error: error)
      }
    }
  }

  @objc public func emitDeepLink(_ deepLink: String) {
    deepLinkEmitter.send(deepLink)
  }

  @objc public func emitCreditConversion(_ conversion: [String: Any]) {
    creditConversionEmitter.send(conversion)
  }

  @objc public func emitAvailableRewards(_ rewards: [[String: Any]]) {
    rewardEmitter.send(rewards)
  }

  @objc public func getSportsMatchup(
    _ matchupId: String, resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    Task { @MainActor in
      do {
        guard
          let match = try await self.nativeClient.api.matchup(
            for: matchupId)
        else {
          resolve(nil)
          return
        }

        resolve(sportMatchupToMap(match: match))
      } catch {
        ErrorMapper.reject(reject, error: error)
      }
    }
  }

  @objc public func getUser(
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    switch nativeClient.user {
    case .some(let user):
      resolve(sdkUserToMap(user: user))
    case .none:
      resolve(nil)
    }
  }

  @objc public func present(
    _ flowName: String, matchupId: String?, teamInviteId: String?,
    gameId: String?,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    assert(flowName.isEmpty == false)

    do {
      let flow = try LucraUtils.stringToLucraFlow(
        flowName, matchupId: matchupId, teamInviteId: teamInviteId,
        gameId: gameId)

      DispatchQueue.main.async {
        UIViewController.topViewController?.present(
          lucraFlow: flow,
          client: self.nativeClient,
          animated: true
        )
        // Resolves when the view has been presented
        resolve(nil)
      }
    } catch {
      ErrorMapper.reject(reject, error: error)
    }
  }

  @objc public func createGamesMatchup(
    _ gameId: String,
    wagerAmount: Double,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    Task { @MainActor in
      do {
        let result = try await self.nativeClient.api.createGamesMatchup(
          gameTypeId: gameId,
          atStake: Decimal(floatLiteral: wagerAmount)
        )

        resolve(gypCreatedMatchupOutputTopMap(output: result))
      } catch {
        ErrorMapper.reject(reject, error: error)
      }
    }
  }

  @objc
  public func acceptGamesMatchup(
    _ matchupId: String,
    teamId: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    Task { @MainActor in
      do {
        try await self.nativeClient.api.acceptGamesMatchup(
          matchupId: matchupId,
          teamId: teamId
        )
        resolve(nil)
      } catch {
        ErrorMapper.reject(reject, error: error)
      }
    }
  }

  @objc
  public func cancelGamesMatchup(
    _ gameId: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    Task { @MainActor in
      do {
        try await self.nativeClient.api
          .cancelGamesMatchup(matchupId: gameId as String)
        resolve(nil)
      } catch {
        ErrorMapper.reject(reject, error: error)
      }
    }
  }

  @objc public func registerConvertToCreditProvider() {
    self.conversionProvider = ConversionProvider(outer: self)
    self.nativeClient.registerConvertToCreditProvider(self.conversionProvider)
  }

  @objc public func registerRewardProvider() {
    self.rewardProvider = RewardProvider(outer: self)
    self.nativeClient.registerRewardProvider(self.rewardProvider)
  }

  @objc public func getGamesMatchup(
    _ gameId: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    Task { @MainActor in
      do {
        let match = try await self.nativeClient.api.gamesMatchup(for: gameId)
        DispatchQueue.main.async {
          if let match {
            resolve(gamesMatchupToMap(match: match))
          } else {
            resolve(nil)
          }
        }
      } catch {
        ErrorMapper.reject(reject, error: error)
      }
    }
  }

  @objc public func closeFullScreenLucraFlows(
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock) {
        self.nativeClient.closeFullScreenLucraFlows()
        return resolve(nil)
  }
    
  @objc public func logout(
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    Task {
      await self.nativeClient.logout()
      resolve(nil)
    }
  }

  @MainActor @objc public func handleLucraLink(
    _ link: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    if let url = URL(string: link) {
      if let flow = self.nativeClient.handleDeeplink(url: url) {
        // Launch a full screen flow
        UIViewController.topViewController?.present(
          lucraFlow: flow,
          client: self.nativeClient,
          animated: true
        )
        resolve(true)
      } else {
        resolve(false)
      }
    } else {
      resolve(false)
    }

  }

  @objc public func registerDeviceTokenHex(
    _ token: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let data = token.hexadecimal else {
      reject("Invalid Hex String", "The provided hex string is not valid", nil)
      return
    }
    self.nativeClient.registerForPushNotifications(deviceToken: data)
    resolve(nil)
  }

  @objc public func registerDeviceTokenBase64(
    _ token: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let data = Data(base64Encoded: token) else {
      reject(
        "Invalid Base64 String", "The provided base64 string is not valid", nil)
      return
    }
    self.nativeClient.registerForPushNotifications(deviceToken: data)
    resolve(nil)
  }

  @objc public func getFlowController(_ flow: String) -> UIViewController {
    do {
      let nativeFlow = try LucraUtils.stringToLucraFlow(
        flow, matchupId: nil, teamInviteId: nil, gameId: nil)
      return self.nativeClient.ui.flow(nativeFlow, hideCloseButton: true)
    } catch {
      print("There was an error getting the native flow \(error)")
      return self.nativeClient.ui.flow(.profile, hideCloseButton: true)
    }
  }

  @objc public func getProfilePill() -> UIView {
    return self.nativeClient.ui.component(.userProfilePill)
  }

  @objc public func getMiniFeed(
    _ userIDs: [String]?, onSizeChanged: @escaping (CGSize) -> Void
  )
    -> UIView
  {
    return self.nativeClient.ui.component(
      .miniPublicFeed(playerIDs: userIDs),
      parentUIViewController: UIViewController(),
      onSizeChanged: onSizeChanged)
  }

  @objc public func getCreateContestButton() -> UIView {
    return self.nativeClient.ui.component(.createContestButton)
  }

  @objc public func getRecommendedMatchup() -> UIView {
    return self.nativeClient.ui.component(.recommendedMatchup)
  }

  @objc public func getContestCard(
    _ contestId: String?, onSizeChanged: @escaping (CGSize) -> Void
  )
    -> UIView
  {
    return self.nativeClient.ui.component(
      .contestCard(contestId: contestId!),
      parentUIViewController: UIViewController(),
      onSizeChanged: onSizeChanged)
  }

  @MainActor @objc public func handleVenmoUrl(url: URL) -> Bool {
    return self.nativeClient.handlePaypalVenmoCallback(url: url)
  }

  @objc public func getRecommendedTournaments(
    _ params: [String: Any], resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    let includeClosed: Bool = params["includeClosed"] as? Bool ?? true
    let limit: Int = params["limit"] as? Int ?? 50

    Task { @MainActor in
      do {
        let tournaments = try await self.nativeClient.api
          .getRecommendedTournaments(
            includeClosed: includeClosed, limit: limit
          )
        resolve(tournaments.map(tournametsMatchupToMap))
      } catch {
        ErrorMapper.reject(reject, error: error)
      }
    }
  }

  @objc public func tournamentMatchup(
    _ id: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock
  ) {
    Task { @MainActor in
      do {
        if let tournament = try await self.nativeClient.api.tournamentsMatchup(
          for: id
        ) {
          resolve(tournametsMatchupToMap(tournament: tournament))
        } else {
          resolve(nil)
        }
      } catch {
        ErrorMapper.reject(reject, error: error)
      }

    }
  }

  @objc public func joinTournament(
    _ id: String, resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    Task { @MainActor in
      do {
        try await self.nativeClient.api.self.joinTournament(id: id)
        resolve(nil)
      } catch {
        ErrorMapper.reject(reject, error: error)
      }
    }
  }
}
