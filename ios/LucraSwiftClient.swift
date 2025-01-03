import Combine
import LucraSDK

@objc public protocol LucraClientDelegate {
  func sendEvent(name: String, result: [String: Any])
}

@objc public class LucraSwiftClient: NSObject {
  @objc weak public var delegate: LucraClientDelegate? = nil
  private var nativeClient: LucraSDK.LucraClient!
  private var userCallback: RCTResponseSenderBlock?
  private var userSinkCancellable: AnyCancellable?
  private var eventSinkCancellable: AnyCancellable?
  private let deepLinkEmitter = PassthroughSubject<String, Never>()
  public let creditConversionEmitter = PassthroughSubject<[String: Any], Never>()
  public let rewardEmitter = PassthroughSubject<[[String: Any]], Never>()
  private var rewardProvider: RewardProvider!
  private var conversionProvider: ConversionProvider!

  static public var shared = LucraSwiftClient()

  @objc static public func getShared() -> LucraSwiftClient {
    return shared
  }

  @objc
  public func initialize(
    _ options: [String: Any],
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    guard nativeClient == nil else {
      resolver(nil)
      return
    }

    guard let apiURL = options["apiURL"] as? String
    else {
      rejecter(
        "Lucra SDK Error",
        "no apiURL passed to LucraSDK constructor",
        nil
      )
      return
    }
    guard let apiKey = options["apiKey"] as? String
    else {
      rejecter(
        "Lucra SDK Error",
        "no apiKey passed to LucraSDK constructor",
        nil
      )
      return
    }

    let environment = options["environment"] as? String ?? "develop"
    let merchantID = options["merchantID"] as? String
    let urlScheme = options["urlScheme"] as? String ?? ""

    var clientTheme = ClientTheme()

    if let theme = options["theme"] as? [String: Any] {
      let background = theme["background"] as? String
      let surface = theme["surface"] as? String
      let primary = theme["primary"] as? String
      let secondary = theme["secondary"] as? String
      let tertiary = theme["tertiary"] as? String
      let onBackground = theme["onBackground"] as? String
      let onSurface = theme["onSurface"] as? String
      let onPrimary = theme["onPrimary"] as? String
      let onSecondary = theme["onSecondary"] as? String
      let onTertiary = theme["onTertiary"] as? String

      clientTheme = ClientTheme(
        background: background,
        surface: surface,
        primary: primary,
        secondary: secondary,
        tertiary: tertiary,
        onBackground: onBackground,
        onSurface: onSurface,
        onPrimary: onPrimary,
        onSecondary: onSecondary,
        onTertiary: onTertiary)
    }

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

    nativeClient = LucraSDK.LucraClient(
      config: .init(
        environment: .init(
          apiURL: apiURL,
          apiKey: apiKey,
          environment: nativeEnvironment,
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
        self.delegate?.sendEvent(name: "gamesMatchupCreated", result: ["id": id])
      case .gamesMatchupAccepted(let id):
        self.delegate?.sendEvent(name: "gamesMatchupAccepted", result: ["id": id])
      case .gamesMatchupCanceled(let id):
        self.delegate?.sendEvent(name: "gamesMatchupCanceled", result: ["id": id])
      case .sportsMatchupCreated(let id):
        self.delegate?.sendEvent(name: "sportsMatchupCreated", result: ["id": id])
      case .sportsMatchupAccepted(let id):
        self.delegate?.sendEvent(name: "sportsMatchupAccepted", result: ["id": id])
      case .sportsMatchupCanceled(let id):
        self.delegate?.sendEvent(name: "sportsMatchupCanceled", result: ["id": id])
      @unknown default:
        fatalError()
      }
    }

    userSinkCancellable = nativeClient.$user.sink { user in
      guard let user = user else {
        self.delegate?.sendEvent(name: "user", result: ["user": nil as Any])
        return
      }

      var addressMap: [String: String?]? = nil
      if let address = user.address {
        addressMap = [
          "address": address.address,
          "addressCont": address.addressCont,
          "city": address.city,
          "state": address.state,
          "zip": address.zip,
        ]
      }

      let userMap = [
        "user": [
          "id": user.id as Any,
          "username": user.username as Any,
          "avatarURL": user.avatarURL as Any,
          "phoneNumber": user.phoneNumber as Any,
          "email": user.email as Any,
          "firstName": user.firstName as Any,
          "lastName": user.lastName as Any,
          "address": addressMap as Any,
          "balance": user.balance,
          "accountStatus": user.accountStatus.rawValue,
          "dateOfBirth": user.dateOfBirth as Any,
        ]
      ]

      self.delegate?.sendEvent(name: "user", result: userMap)
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
        self.delegate?.sendEvent(name: "_deepLink", result: ["link": lucraDeepLink])

      }
      return deeplink
    }

    resolver(nil)
  }

  @objc
  public func configureUser(
    _ user: [String: Any], resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    var sdkAddress: LucraSDK.Address?
    if let address = user["address"] as? [String: Any] {
      sdkAddress = LucraSDK.Address(
        address: address["address"] as? String,
        addressCont: address["addressCont"] as? String,
        city: address["city"] as? String,
        state: address["state"] as? String,
        zip: address["zip"] as? String
      )
    }
    let sdkUser = SDKUser(
      username: user["username"] as? String,
      avatarURL: user["avatarURL"] as? String,
      phoneNumber: user["phoneNumber"] as? String,
      email: user["email"] as? String,
      firstName: user["firstName"] as? String,
      lastName: user["lastName"] as? String,
      address: sdkAddress,
      dateOfBirth: user["dateOfBirth"] as? Date
    )

    Task {
      do {
        try await nativeClient.configure(user: sdkUser)
        resolve(nil)
      } catch {
        reject("Lucra SDK Error", "\(error)", nil)
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
        guard let match = try await self.nativeClient.api.sportsMatchup(for: matchupId) else {
          resolve(nil)
          return
        }

        resolve(sportMatchupToMap(match: match))
      } catch {
        reject("\(error)", error.localizedDescription, nil)
      }
    }
  }

//  @objc public func cancelSportsMatchup(
//    _ matchupId: String, resolve: @escaping RCTPromiseResolveBlock,
//    reject: @escaping RCTPromiseRejectBlock
//  ) {
//    Task { @MainActor in
//      do {
//        guard let match = try await self.nativeClient.api.sportsMatchup(for: matchupId) else {
//          reject("NotFound", "Matchup not found", nil)
//          return
//        }
//
//        //        self.nativeClient.api.can
//      }
//    }
//  }

  @objc public func getUser(
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    switch nativeClient.user {
    case .some(let user):
      var userJS: [String: Any] = [
        "username": user.username ?? NSNull(),
        "avatarURL": user.avatarURL ?? NSNull(),
        "phoneNumber": user.phoneNumber ?? NSNull(),
        "email": user.email ?? NSNull(),
        "firstName": user.firstName ?? NSNull(),
        "lastName": user.lastName ?? NSNull(),
        "dateOfBirth": user.dateOfBirth ?? NSNull(),
      ]

      switch user.address {
      case .some(let address):
        userJS["address"] = [
          "address": address.address,
          "addressCont": address.addressCont,
          "city": address.city,
          "state": address.state,
          "zip": address.zip,
        ]
      default: break
      }

      resolve(userJS)
    case .none:
      resolve(nil)
    }
  }

  private func getLucraFlow(
    _ lucraFlow: String, matchupId: String?, teamInviteId: String?, gameId: String?
  )
    -> LucraSDK.LucraFlow
  {
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

  @objc public func present(
    _ lucraFlow: String, matchupId: String?, teamInviteId: String?, gameId: String?
  ) {
    DispatchQueue.main.async {
      let nativeFlow = self.getLucraFlow(
        lucraFlow, matchupId: matchupId, teamInviteId: teamInviteId, gameId: gameId)
      UIViewController.topViewController?.present(
        lucraFlow: nativeFlow,
        client: self.nativeClient,
        animated: true
      )
    }
  }

  @objc public func createGamesMatchup(
    _ gameId: String,
    wagerAmount: Double,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    Task { @MainActor in
      do {
        let result = try await self.nativeClient.api.createGamesMatchup(
          gameTypeId: gameId,
          atStake: Decimal(floatLiteral: wagerAmount)
        )

        resolver([
          "matchupId": result.matchupId,
          "ownerTeamId": result.ownerTeamId,
          "opponentTeamId": result.opponentTeamId,
        ])
      } catch {
        rejecter("\(error)", error.localizedDescription, nil)
      }
    }
  }

  @objc
  public func acceptGamesMatchup(
    _ matchupId: String,
    teamId: String,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    Task { @MainActor in
      do {
        try await self.nativeClient.api.acceptGamesMatchup(
          matchupId: matchupId,
          teamId: teamId
        )
        resolver(nil)
      } catch {
        rejecter("\(error)", error.localizedDescription, nil)
      }
    }
  }

  @objc
  public func cancelGamesMatchup(
    _ gameId: String,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    Task { @MainActor in
      do {
        try await self.nativeClient.api
          .cancelGamesMatchup(matchupId: gameId as String)
        resolver(nil)
      } catch {
        rejecter("\(error)", error.localizedDescription, nil)
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
        reject("\(error)", error.localizedDescription, nil)
      }
    }
  }

  @objc
  public func logout(
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    Task {
      await self.nativeClient.logout()
      resolve(nil)
    }
  }

  @MainActor @objc
  public func handleLucraLink(
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

  @objc
  public func registerDeviceTokenHex(
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

  @objc
  public func registerDeviceTokenBase64(
    _ token: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let data = Data(base64Encoded: token) else {
      reject("Invalid Base64 String", "The provided base64 string is not valid", nil)
      return
    }
    self.nativeClient.registerForPushNotifications(deviceToken: data)
    resolve(nil)
  }

  @objc public func getFlowController(_ flow: String) -> UIViewController {
    let nativeFlow = getLucraFlow(flow, matchupId: nil, teamInviteId: nil, gameId: nil)
    return self.nativeClient.ui.flow(nativeFlow, hideCloseButton: true)
  }

  @objc public func getProfilePill() -> UIView {
    return self.nativeClient.ui.component(.userProfilePill)
  }

  @objc public func getMiniFeed(_ userIDs: [String]?, onSizeChanged: @escaping (CGSize) -> Void)
    -> UIView
  {
    return self.nativeClient.ui.component(
      .miniPublicFeed(playerIDs: userIDs), parentUIViewController: UIViewController(),
      onSizeChanged: onSizeChanged)
  }

  @objc public func getCreateContestButton() -> UIView {
    return self.nativeClient.ui.component(.createContestButton)
  }

  @objc public func getRecommendedMatchup() -> UIView {
    return self.nativeClient.ui.component(.recommendedMatchup)
  }

  @objc public func getContestCard(_ contestId: String?, onSizeChanged: @escaping (CGSize) -> Void)
    -> UIView
  {
    return self.nativeClient.ui.component(
      .contestCard(contestId: contestId!), parentUIViewController: UIViewController(),
      onSizeChanged: onSizeChanged)
  }

  @MainActor @objc public func handleVenmoUrl(url: URL) -> Bool {
    return self.nativeClient.handlePaypalVenmoCallback(url: url)
  }
}
