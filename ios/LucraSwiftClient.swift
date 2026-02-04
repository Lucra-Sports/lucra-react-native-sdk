import Combine
import LucraSDK

private enum ErrorCode {
  static let apiError = "apiError"
  static let locationError = "locationError"
  static let insufficientFunds = "insufficientFunds"
  static let notAllowed = "notAllowed"
  static let notInitialized = "notInitialized"
  static let unverified = "unverified"
  static let missingDemographicInformation = "missingDemographicInformation"
  static let unknownError = "unknownError"
}

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

      print("LucraSDK.LucraClient available events: \(event)")

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
      case .gamesMatchupStarted(let id):
        self.delegate?.sendEvent(
          name: "gamesMatchupStarted", result: ["id": id])
      case .gamesActiveMatchupStarted(id: let id, matchup: _):
        self.delegate?.sendEvent(
          name: "gamesActiveMatchupStarted", result: ["id": id])
      case .sportsMatchupCreated(let id):
        self.delegate?.sendEvent(
          name: "sportsMatchupCreated", result: ["id": id])
      case .sportsMatchupAccepted(let id):
        self.delegate?.sendEvent(
          name: "sportsMatchupAccepted", result: ["id": id])
      case .sportsMatchupCanceled(let id):
        self.delegate?.sendEvent(
          name: "sportsMatchupCanceled", result: ["id": id])
      case .tournamentJoined(let id):
        self.delegate?.sendEvent(
          name: "tournamentJoined", result: ["id": id])
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
    
    @objc public func registerConvertToCreditProvider() {
                      self.conversionProvider = ConversionProvider(outer: self)
                      self.nativeClient.registerConvertToCreditProvider(self.conversionProvider)
                  }
                  
                  @objc public func registerRewardProvider() {
                      self.rewardProvider = RewardProvider(outer: self)
                      self.nativeClient.registerRewardProvider(self.rewardProvider)
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

  // TODO Remove reference entirely - all matchup fetching will come from the generic getMatchup headless call
  // @objc public func getSportsMatchup(
  //   _ matchupId: String, resolve: @escaping RCTPromiseResolveBlock,
  //   reject: @escaping RCTPromiseRejectBlock
  // ) {
  //   Task { @MainActor in
  //     do {
  //       guard
  //         let match = try await self.nativeClient.api.matchup(
  //           for: matchupId)
  //       else {
  //         resolve(nil)
  //         return
  //       }

  //       resolve(sportMatchupToMap(match: match))
  //     } catch {
  //       ErrorMapper.reject(reject, error: error)
  //     }
  //   }
  // }

  @objc public func getUser(
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    switch nativeClient.user {
    case .some(let user):
      resolve(sdkUserToMap(user: user))
    case .none:
      reject("USER_NOT_FOUND", "User not found", nil)
    }
  }

  @objc public func present(
    _ flowName: String, matchupId: String?, teamInviteId: String?,
    gameId: String?, location: String?,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    assert(flowName.isEmpty == false)

    do {
      let flow = try LucraUtils.stringToLucraFlow(
        flowName, matchupId: matchupId, teamInviteId: teamInviteId,
        gameId: gameId, location: location)

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

    @objc public func createRecreationalGame(
      _ gameTypeId: String,
      atStake: NSDictionary,
      playStyle: String,
      resolve: @escaping RCTPromiseResolveBlock,
      reject: @escaping RCTPromiseRejectBlock
    ) {
      Task { @MainActor in
        // Parse atStake
        let rewardType: RewardType
        if let type = (atStake["type"] as? String)?.lowercased() {
          switch type {
          case "cash":
            guard let amount = atStake["amount"] as? Double else {
              reject("invalidAtStake", "Missing or invalid 'amount' for type 'cash'", nil)
              return
            }
            rewardType = RewardType(cashReward: Decimal(amount))

          case "tenantreward":
            let rewardId = atStake["rewardId"] as? String ?? ""
            let title = atStake["title"] as? String ?? ""
            let descriptor = atStake["descriptor"] as? String ?? ""
            let iconUrl = atStake["iconUrl"] as? String ?? ""
            let bannerIconUrl = atStake["bannerIconUrl"] as? String
            let disclaimer = atStake["disclaimer"] as? String
            let metadataRaw = atStake["metadata"] as? [String: Any]
            let metadata = metadataRaw?.compactMapValues { "\($0)" }

            let lucraReward = LucraReward(
              rewardId: rewardId,
              title: title,
              descriptor: descriptor,
              iconUrl: iconUrl,
              bannerIconUrl: bannerIconUrl,
              disclaimer: disclaimer,
              metadata: metadata
            )

            rewardType = RewardType(tenantReward: lucraReward)

          default:
            reject("invalidRewardType", "Invalid RewardType: \(type)", nil)
            return
          }
        } else {
          reject("invalidAtStake", "Missing 'type' in atStake", nil)
          return
        }

        // Parse playStyle
        let parsedPlayStyle: PlayStyle
        switch playStyle.lowercased() {
        case "groupvsgroup":
          parsedPlayStyle = .groupVsGroup
        case "freeforall":
          parsedPlayStyle = .freeForAll
        default:
          reject("invalidPlayStyle", "Invalid PlayStyle: \(playStyle)", nil)
          return
        }

        // Call API
        let result = await self.nativeClient.api.createRecreationalGame(
          gameTypeId: gameTypeId,
          atStake: rewardType,
          playStyle: parsedPlayStyle
        )

        switch result {
        case .success(let matchupId):
          resolve(["matchupId": matchupId])
        case .failure(let error):
          rejectLucraError(reject, error: error)
        }
      }
    }



    @objc public func acceptVersusRecreationalGame(
      _ matchupId: String,
      teamId: String,
      resolve: @escaping RCTPromiseResolveBlock,
      reject: @escaping RCTPromiseRejectBlock
    ) {
      Task { @MainActor in
        let result = await self.nativeClient.api.acceptVersusRecreationalGame(
          matchupId: matchupId,
          groupId: teamId
        )

        switch result {
        case .success:
          resolve(nil)
        case .failure(let error):
          rejectLucraError(reject, error: error)
        }
      }
    }

    @objc public func acceptFreeForAllRecreationalGame(
      _ matchupId: String,
      resolve: @escaping RCTPromiseResolveBlock,
      reject: @escaping RCTPromiseRejectBlock
    ) {
      Task { @MainActor in
        let result = await self.nativeClient.api.acceptFreeForAllRecreationalGame(
          matchupId: matchupId
        )

        switch result {
        case .success:
          resolve(nil)
        case .failure(let error):
          rejectLucraError(reject, error: error)
        }
      }
    }

    @objc public func cancelGamesMatchup(
      _ matchupId: String,
      resolve: @escaping RCTPromiseResolveBlock,
      reject: @escaping RCTPromiseRejectBlock
    ) {
      Task { @MainActor in
        let result = await self.nativeClient.api.cancelRecreationalGame(
          matchupId: matchupId
        )

        switch result {
        case .success:
          resolve(nil)
        case .failure(let error):
          rejectLucraError(reject, error: error)
        }
      }
    }

    @objc public func getMatchup(
      _ matchupId: String,
      resolve: @escaping RCTPromiseResolveBlock,
      reject: @escaping RCTPromiseRejectBlock
    ) {
      Task { @MainActor in
        let result = await self.nativeClient.api.matchup(for: matchupId)

        switch result {
        case .success(let matchup):
          let res = lucraMatchupToMap(match: matchup)
          resolve(res)
        case .failure(let error):
          rejectLucraError(reject, error: error)
        }
      }
    }

    private func rejectLucraError(_ reject: RCTPromiseRejectBlock, error: Error) {
      let code: String
      let message: String

      switch error {
      case let matchupError as MatchupError:
        switch matchupError {
        case .user(let userError):
          code = codeForUserStateError(userError)
          message = messageForUserStateError(userError)
        case .location(let locationError):
          code = ErrorCode.locationError
          message = extractMessage(from: locationError)
        case .customError(let messageString):
          code = ErrorCode.apiError
          message = messageString
        case .unknown:
          code = ErrorCode.unknownError
          message = extractMessage(from: matchupError)
        @unknown default:
          code = ErrorCode.unknownError
          message = extractMessage(from: matchupError)
        }
      case let gamesMatchupError as GamesMatchupError:
        switch gamesMatchupError {
        case .user(let userError):
          code = codeForUserStateError(userError)
          message = messageForUserStateError(userError)
        case .location(let locationError):
          code = ErrorCode.locationError
          message = extractMessage(from: locationError)
        case .customError(let messageString):
          code = ErrorCode.apiError
          message = messageString
        case .unknown:
          code = ErrorCode.unknownError
          message = extractMessage(from: gamesMatchupError)
        @unknown default:
          code = ErrorCode.unknownError
          message = extractMessage(from: gamesMatchupError)
        }
      case let tournamentError as TournamentError:
        switch tournamentError {
        case .user(let userError):
          code = codeForUserStateError(userError)
          message = messageForUserStateError(userError)
        case .location(let locationError):
          code = ErrorCode.locationError
          message = extractMessage(from: locationError)
        case .customError(let messageString):
          code = ErrorCode.apiError
          message = messageString
        case .unknown:
          code = ErrorCode.unknownError
          message = extractMessage(from: tournamentError)
        @unknown default:
          code = ErrorCode.unknownError
          message = extractMessage(from: tournamentError)
        }
      case let apiError as APIError:
        code = ErrorCode.apiError
        message = extractMessage(from: apiError)
      case let locationError as LocationError:
        code = ErrorCode.locationError
        message = extractMessage(from: locationError)
      case let userError as UserStateError:
        code = codeForUserStateError(userError)
        message = messageForUserStateError(userError)
      default:
        code = ErrorCode.unknownError
        message = extractMessage(from: error)
      }

      reject(code, message, error)
    }

    private func extractMessage(from error: Error) -> String {
      if let apiError = error as? APIError {
        if let desc = apiError.errorDescription, desc.isEmpty == false {
          return desc
        }

        if apiError.underlyingError.isEmpty == false {
          return apiError.underlyingError
        }
      }

      if let localized = (error as? LocalizedError)?.errorDescription,
         localized.isEmpty == false {
        return localized
      }

      let fallback = error.localizedDescription
      return fallback.isEmpty ? "Unknown error occurred" : fallback
    }

    private func codeForUserStateError(_ error: UserStateError) -> String {
      switch error {
      case .insufficientFunds:
        return ErrorCode.insufficientFunds
      case .notAllowed:
        return ErrorCode.notAllowed
      case .notInitialized:
        return ErrorCode.notInitialized
      case .unverified:
        return ErrorCode.unverified
      case .demographicInformationMissing:
        return ErrorCode.missingDemographicInformation
      @unknown default:
        return ErrorCode.unknownError
      }
    }

    private func messageForUserStateError(_ error: UserStateError) -> String {
      switch error {
      case .insufficientFunds:
        return "User has insufficient funds"
      case .notAllowed:
        return "User is not allowed to perform such operation"
      case .notInitialized:
        return "User has not been initialized"
      case .unverified:
        return "User has not been verified"
      case .demographicInformationMissing:
        return "User has missing demographic information"
      @unknown default:
        return "Unknown user state error"
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
        flow, matchupId: nil, teamInviteId: nil, gameId: nil, location: nil)
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
      let result = await self.nativeClient.api.getRecommendedTournaments(
        includeClosed: includeClosed, limit: limit
      )

      switch result {
      case .success(let tournaments):
        resolve(tournaments.map(tournamentsMatchupToMap))
      case .failure(let error):
        rejectLucraError(reject, error: error)
      }
    }
  }

  @objc public func tournamentMatchup(
    _ id: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock
  ) {
    Task { @MainActor in
      let result = await self.nativeClient.api.tournamentsMatchup(for: id)

      switch result {
      case .success(let tournament):
        resolve(tournamentsMatchupToMap(tournament: tournament))
      case .failure(let error):
        rejectLucraError(reject, error: error)
      }
    }
  }

  @objc public func joinTournament(
    _ matchupId: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    Task { @MainActor in
      let result = await self.nativeClient.api.joinTournament(
        matchupId: matchupId,
        joinCode: nil
      )

      switch result {
      case .success:
        resolve(nil)
      case .failure(let error):
        rejectLucraError(reject, error: error)
      }
    }
  }
}
