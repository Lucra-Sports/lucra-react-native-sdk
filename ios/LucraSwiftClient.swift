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
  static let unsupported = "unsupported"
}

private enum PhoneAuthErrorCode {
  static let invalidPhoneNumber = "invalidPhoneNumber"
  static let phoneNumberNotSubmitted = "phoneNumberNotSubmitted"
  static let invalidCode = "invalidCode"
  static let alreadyLoggedIn = "alreadyLoggedIn"
  static let messagingDisabled = "messagingDisabled"
  static let smsNotDelivered = "smsNotDelivered"
  static let tooManyAttempts = "tooManyAttempts"
  static let networkError = "networkError"
}

private enum HandshakeAuthErrorCode {
  static let noProviderRegistered = "noProviderRegistered"
  static let providerTimedOut = "providerTimedOut"
  static let providerFailed = "providerFailed"
  static let exchangeFailed = "exchangeFailed"
  static let tenantIdUnavailable = "tenantIdUnavailable"
  static let tosNotAccepted = "tosNotAccepted"
}

private struct TelemetryDiagnosticError: LocalizedError {
  let message: String
  var errorDescription: String? { "TelemetryDiagnosticError: \(message)" }
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
  private var gamesMatchupFeeTimer: Timer?
  private var lastEmittedGamesMatchupFee: Decimal?
  private let handshakeTokenBridge = HandshakeTokenBridge()
  private var authStateCancellable: AnyCancellable?

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
    var themeMode: LucraSDK.LucraThemeMode? = nil

    if let theme = options["theme"] as? [String: Any] {
      clientTheme = mapToClientTheme(theme: theme)
      themeMode = mapToThemeMode(theme["themeMode"])
    }

    let environment = LucraUtils.stringToEnvironment(
      options["environment"] as? String)

    let autoJoin = options["autoJoin"] as? Bool ?? true
    let allowRewardSheetToDisplay =
      options["allowRewardSheetToDisplay"] as? Bool ?? true

    nativeClient = LucraSDK.LucraClient(
      config: .init(
        environment: .init(
          apiKey: apiKey,
          environment: environment,
          urlScheme: urlScheme,
          merchantID: merchantID,
          autoJoin: autoJoin,
          allowRewardSheetToDisplay: allowRewardSheetToDisplay
        ),
        appearance: clientTheme,
        themeMode: themeMode
      )
    )

    // Handshake in-flight, the last handshake failure, and auth-state
    // resolution ride one payload so a consumer can never see the in-flight
    // flag drop before the error that caused it. `@Published` replays on
    // subscribe, so this also seeds the JS-side cache immediately.
    authStateCancellable = Publishers.CombineLatest3(
      nativeClient.$isHandshakeAuthInFlight,
      nativeClient.$handshakeAuthError,
      nativeClient.$isResolvingAuthState
    )
    .receive(on: RunLoop.main)
    .sink { [weak self] inFlight, handshakeError, isResolving in
      guard let self else { return }
      self.delegate?.sendEvent(
        name: "authState",
        result: self.authStateMap(
          inFlight: inFlight, error: handshakeError, isResolving: isResolving))
    }

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
      case .tournamentJoined(let id, let gameId):
        self.delegate?.sendEvent(
          name: "tournamentJoined", result: ["id": id, "gameId": gameId as Any])
      case .autoJoinedTournaments(let tournamentIds):
        self.delegate?.sendEvent(
          name: "tournamentsAutoJoined", result: ["tournamentIds": tournamentIds])
      case .miniGameFinished(let gameId, let gameMode, let amount, let matchupId):
        self.delegate?.sendEvent(
          name: "miniGameFinished",
          result: [
            "gameId": gameId as Any,
            "gameMode": gameMode?.rawValue as Any,
            "amount": (amount as NSDecimalNumber?)?.doubleValue as Any,
            "matchupId": matchupId as Any,
          ])
      @unknown default:
        break
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
    gameMode: String?, amount: NSNumber?,
    handlePostNavigation: NSNumber?,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    assert(flowName.isEmpty == false)

    do {
      let flow = try LucraUtils.stringToLucraFlow(
        flowName, matchupId: matchupId, teamInviteId: teamInviteId,
        gameId: gameId, location: location,
        gameMode: gameMode, amount: amount?.decimalValue,
        handlePostNavigation: handlePostNavigation?.boolValue ?? false)

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
      minigameEnabled: Bool,
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
          playStyle: parsedPlayStyle,
          minigameEnabled: minigameEnabled
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

    @objc public func getMatchupDetails(
      _ matchupId: String,
      resolve: @escaping RCTPromiseResolveBlock,
      reject: @escaping RCTPromiseRejectBlock
    ) {
      Task { @MainActor in
        // Annotated to pick the one-shot async overload over the AsyncStream one.
        let result: Result<LucraMatchupDetails, GamesMatchupError> =
          await self.nativeClient.api.getMatchupDetails(matchupId: matchupId)

        switch result {
        case .success(let details):
          resolve(lucraMatchupDetailsToMap(details: details))
        case .failure(let error):
          rejectLucraError(reject, error: error)
        }
      }
    }

    @objc public func subscribeMatchupDetails(_ matchupId: String) {
      Task { @MainActor in
        // The AsyncStream overload fires immediately and again on every
        // server-side change; cancelMatchupDetailsSubscription() finishes it.
        let stream: AsyncStream<Result<LucraMatchupDetails, GamesMatchupError>> =
          self.nativeClient.api.getMatchupDetails(matchupId: matchupId)

        for await result in stream {
          switch result {
          case .success(let details):
            self.delegate?.sendEvent(
              name: "matchupDetails",
              result: [
                "matchupId": matchupId,
                "details": lucraMatchupDetailsToMap(details: details)
              ])
          case .failure(let error):
            let (code, message) = self.lucraErrorCodeMessage(error)
            self.delegate?.sendEvent(
              name: "matchupDetails",
              result: [
                "matchupId": matchupId,
                "error": ["code": code, "message": message]
              ])
          }
        }
      }
    }

    @objc public func cancelMatchupDetailsSubscription() {
      Task { @MainActor in
        self.nativeClient.api.cancelMatchupDetailsSubscription()
      }
    }

    @objc public func preloadGeoToken(_ context: String) {
      let tokenType: MiniGameGeoTokenType
      switch context.lowercased() {
      case "freebuyin":
        tokenType = .freeBuyIn
      case "cashbuyin":
        tokenType = .cashBuyIn
      case "freeminigame", "freeminigames":
        tokenType = .freeMinigame
      case "cashminigame", "cashminigames":
        tokenType = .cashMinigame
      default:
        // Unknown context — don't pre-warm a (possibly wrong) token.
        return
      }
      DispatchQueue.main.async {
        self.nativeClient.api.preloadGeoToken(type: tokenType)
      }
    }

    @objc public func startMiniGame(
      _ gameId: String,
      gameMode: String,
      amount: Double,
      matchupId: String,
      resolve: @escaping RCTPromiseResolveBlock,
      reject: @escaping RCTPromiseRejectBlock
    ) {
      Task { @MainActor in
        let parsedMode: MiniGameMode
        switch gameMode.lowercased() {
        case "practice":
          parsedMode = .practice
        case "1v1":
          parsedMode = .oneVsOne
        case "free_for_all":
          parsedMode = .freeForAll
        case "tournament":
          parsedMode = .tournament
        default:
          reject("invalidGameMode", "Invalid MiniGameMode: \(gameMode)", nil)
          return
        }

        let optionalMatchupId: String? = matchupId.isEmpty ? nil : matchupId

        let result = await self.nativeClient.api.startMiniGame(
          gameId: gameId,
          gameMode: parsedMode,
          amount: Decimal(amount),
          matchupId: optionalMatchupId,
          onProgress: nil
        )

        switch result {
        case .success(let session):
          resolve([
            "url": session.iframeURL.absoluteString,
            "sessionId": session.sessionId,
            "matchupId": session.matchupId as Any
          ])
        case .failure(let error):
          rejectLucraError(reject, error: error)
        }
      }
    }

    // MARK: - Rewards & Achievements headless (Minigames Headless epic)

    @objc public func getUserTournamentRewards(
      _ params: [String: Any],
      resolve: @escaping RCTPromiseResolveBlock,
      reject: @escaping RCTPromiseRejectBlock
    ) {
      let tournamentId = params["tournamentId"] as? String
      let viewed = params["viewed"] as? Bool
      let claimed = params["claimed"] as? Bool

      Task { @MainActor in
        let result = await self.nativeClient.api.getUserTournamentRewards(
          viewed: viewed, claimed: claimed, tournamentId: tournamentId)

        switch result {
        case .success(let rewards):
          resolve(rewards.map { earnedRewardToMap($0) })
        case .failure(let error):
          rejectLucraError(reject, error: error)
        }
      }
    }

    @objc public func claimReward(
      _ rewardId: String,
      resolve: @escaping RCTPromiseResolveBlock,
      reject: @escaping RCTPromiseRejectBlock
    ) {
      Task { @MainActor in
        let result = await self.nativeClient.api.claimRewards(rewardId: rewardId)

        switch result {
        case .success:
          resolve(nil)
        case .failure(let error):
          rejectLucraError(reject, error: error)
        }
      }
    }

    @objc public func markRewardViewed(
      _ rewardId: String,
      resolve: @escaping RCTPromiseResolveBlock,
      reject: @escaping RCTPromiseRejectBlock
    ) {
      Task { @MainActor in
        let result = await self.nativeClient.api.markRewardAsViewed(rewardId: rewardId)

        switch result {
        case .success:
          resolve(nil)
        case .failure(let error):
          rejectLucraError(reject, error: error)
        }
      }
    }

    @objc public func getUserAchievements(
      _ params: [String: Any],
      resolve: @escaping RCTPromiseResolveBlock,
      reject: @escaping RCTPromiseRejectBlock
    ) {
      let viewed = params["viewed"] as? Bool
      let claimed = params["claimed"] as? Bool
      let includeNoProgress = params["includeNoProgress"] as? Bool ?? true

      Task { @MainActor in
        let result = await self.nativeClient.api.getUserAchievements(
          viewed: viewed, claimed: claimed, includeNoProgress: includeNoProgress)

        switch result {
        case .success(let achievements):
          resolve(achievements.map { userAchievementToMap($0) })
        case .failure(let error):
          rejectLucraError(reject, error: error)
        }
      }
    }

    @objc public func claimAchievement(
      _ userAchievementId: String,
      resolve: @escaping RCTPromiseResolveBlock,
      reject: @escaping RCTPromiseRejectBlock
    ) {
      Task { @MainActor in
        let result = await self.nativeClient.api.claimAchievement(userAchievementId: userAchievementId)

        switch result {
        case .success:
          resolve(nil)
        case .failure(let error):
          rejectLucraError(reject, error: error)
        }
      }
    }

    @objc public func markAchievementViewed(
      _ userAchievementId: String,
      resolve: @escaping RCTPromiseResolveBlock,
      reject: @escaping RCTPromiseRejectBlock
    ) {
      Task { @MainActor in
        let result = await self.nativeClient.api.markAchievementAsViewed(userAchievementId: userAchievementId)

        switch result {
        case .success:
          resolve(nil)
        case .failure(let error):
          rejectLucraError(reject, error: error)
        }
      }
    }

    @objc public func getMiniGames(
      _ resolve: @escaping RCTPromiseResolveBlock,
      reject: @escaping RCTPromiseRejectBlock
    ) {
      Task { @MainActor in
        let result = await self.nativeClient.api.getMiniGames()

        switch result {
        case .success(let games):
          resolve(games.map { miniGameCatalogItemToMap($0) })
        case .failure(let error):
          rejectLucraError(reject, error: error)
        }
      }
    }

    private func rejectLucraError(_ reject: RCTPromiseRejectBlock, error: Error) {
      let (code, message) = lucraErrorCodeMessage(error)
      reject(code, message, error)
    }

    private func lucraErrorCodeMessage(_ error: Error) -> (code: String, message: String) {
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
      case let rewardError as RewardError:
        switch rewardError {
        case .user(let userError):
          code = codeForUserStateError(userError)
          message = messageForUserStateError(userError)
        case .customError(let messageString):
          code = ErrorCode.apiError
          message = messageString
        case .unknown:
          code = ErrorCode.unknownError
          message = extractMessage(from: rewardError)
        @unknown default:
          code = ErrorCode.unknownError
          message = extractMessage(from: rewardError)
        }
      case let achievementError as AchievementError:
        switch achievementError {
        case .user(let userError):
          code = codeForUserStateError(userError)
          message = messageForUserStateError(userError)
        case .customError(let messageString):
          code = ErrorCode.apiError
          message = messageString
        case .unknown:
          code = ErrorCode.unknownError
          message = extractMessage(from: achievementError)
        @unknown default:
          code = ErrorCode.unknownError
          message = extractMessage(from: achievementError)
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

      return (code, message)
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

  @MainActor @objc public func parseLucraLink(
    _ link: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let url = URL(string: link),
      let flow = self.nativeClient.handleDeeplink(url: url)
    else {
      resolve(nil)
      return
    }
    resolve(lucraFlowToMap(flow))
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
      return self.nativeClient.ui.flowViewController(nativeFlow, hideCloseButton: true)
    } catch {
      print("There was an error getting the native flow \(error)")
      return self.nativeClient.ui.flowViewController(.profile, hideCloseButton: true)
    }
  }

  @objc public func getProfilePill() -> UIView {
    return self.nativeClient.ui.component(
      .userProfilePill, parentUIViewController: UIViewController())
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
    return self.nativeClient.ui.component(
      .createContestButton, parentUIViewController: UIViewController())
  }

  @objc public func getRecommendedMatchup() -> UIView {
    return self.nativeClient.ui.component(
      .recommendedMatchup, parentUIViewController: UIViewController())
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
    let includePrivateViewable: Bool =
      params["includePrivateViewableTournaments"] as? Bool ?? false

    Task { @MainActor in
      let result = await self.nativeClient.api.getRecommendedTournaments(
        includeClosed: includeClosed, limit: limit,
        includePrivateViewableTournaments: includePrivateViewable
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

  @objc public func autoJoinTournaments(
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    Task { @MainActor in
      let result = await self.nativeClient.api.autoJoinTournaments()
      switch result {
      case .success(let tournamentIds):
        resolve(tournamentIds)
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

  @objc public func getTournamentDetails(
    _ tournamentId: String,
    params: [String: Any],
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    let leaderboardLimit = params["leaderboardLimit"] as? Int
    let leaderboardOffset = params["leaderboardOffset"] as? Int

    Task { @MainActor in
      let result = await self.nativeClient.api.retrieveTournamentDetails(
        for: tournamentId,
        leaderboardLimit: leaderboardLimit ?? 10,
        leaderboardOffset: leaderboardOffset ?? 0)

      switch result {
      case .success(let details):
        resolve(tournamentDetailsToMap(details, tournamentId: tournamentId))
      case .failure(let error):
        rejectLucraError(reject, error: error)
      }
    }
  }

  @objc public func submitUserScore(
    _ score: Double,
    tournamentId: String,
    metadata: [String: Any],
    isFinal: Bool,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    Task { @MainActor in
      guard score.isFinite else {
        reject("invalidScore", "score must be a finite number", nil)
        return
      }

      let stringMetadata = metadata.mapValues { "\($0)" }
      let result = await self.nativeClient.api.submitUserScore(
        score,
        tournamentID: tournamentId,
        metadata: stringMetadata,
        isFinal: isFinal
      )

      switch result {
      case .success(let tournament):
        if let tournament = tournament {
          resolve(tournamentsMatchupToMap(tournament: tournament))
        } else {
          resolve(nil)
        }
      case .failure(let error):
        rejectLucraError(reject, error: error)
      }
    }
  }

  // MARK: - User headless (avatar, KYC status, username)

  @objc public func uploadUserAvatar(
    _ imageUri: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    Task { @MainActor in
      guard let image = Self.loadImage(fromUri: imageUri) else {
        reject(
          "invalidImage",
          "Could not load an image from the provided uri",
          nil
        )
        return
      }

      let result = await self.nativeClient.api.uploadAvatar(image: image)

      switch result {
      case .success:
        resolve(nil)
      case .failure(let error):
        rejectLucraError(reject, error: error)
      }
    }
  }

  @objc public func getUserKycStatus(
    _ userId: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    reject(
      ErrorCode.unsupported,
      "getUserKycStatus is not supported by the Lucra iOS SDK yet. "
        + "Read accountStatus from LucraSDK.getUser() for the current user instead.",
      nil
    )
  }

  @objc public func updateUsername(
    _ username: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    Task {
      guard let current = self.nativeClient.user else {
        reject("not_logged_in", "not logged in", nil)
        return
      }
      guard current.username != username else {
        reject("invalid_username", "username is not valid", nil)
        return
      }

      // The iOS SDK has no dedicated username update, so reconfigure the
      // current user with only the username changed.
      let updated = SDKUser(
        username: username,
        avatarURL: current.avatarURL,
        phoneNumber: current.phoneNumber,
        email: current.email,
        firstName: current.firstName,
        lastName: current.lastName,
        address: current.address,
        dateOfBirth: current.dateOfBirth,
        metadata: current.metadata
      )

      do {
        try await self.nativeClient.configure(user: updated)
        resolve(sdkUserToMap(user: self.nativeClient.user ?? updated))
      } catch {
        ErrorMapper.reject(reject, error: error)
      }
    }
  }

  private static func loadImage(fromUri uri: String) -> UIImage? {
    if uri.hasPrefix("data:") {
      guard let commaIndex = uri.firstIndex(of: ","),
        let data = Data(
          base64Encoded: String(uri[uri.index(after: commaIndex)...]))
      else {
        return nil
      }
      return UIImage(data: data)
    }
    if let url = URL(string: uri), url.isFileURL {
      return UIImage(contentsOfFile: url.path)
    }
    return UIImage(contentsOfFile: uri)
  }

  // MARK: - Phone auth headless

  @objc public func submitPhoneNumber(
    _ phoneNumber: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    Task {
      let result = await self.nativeClient.api.submitPhoneNumber(phoneNumber)

      switch result {
      case .success:
        resolve(nil)
      case .failure(let error):
        self.rejectPhoneAuthError(reject, error: error)
      }
    }
  }

  @objc public func submitVerificationCode(
    _ code: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    Task {
      let result = await self.nativeClient.api.submitVerificationCode(code)

      switch result {
      case .success(let user):
        resolve(sdkUserToMap(user: user))
      case .failure(let error):
        self.rejectPhoneAuthError(reject, error: error)
      }
    }
  }

  @objc public func resendCode(
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    Task {
      let result = await self.nativeClient.api.resendCode()

      switch result {
      case .success:
        resolve(nil)
      case .failure(let error):
        self.rejectPhoneAuthError(reject, error: error)
      }
    }
  }

  // MARK: - Handshake authentication

  /// Installs (or clears) the handshake token provider.
  ///
  /// A JS function can't cross the bridge, so `registered` says whether one
  /// exists and the closure below round-trips through the event bus for each
  /// token. Requires `initialize` to have run — `nativeClient` is built there.
  @objc public func registerHandshakeAuthTokenProvider(
    _ registered: Bool,
    bypassTosAgreement: Bool,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    guard nativeClient != nil else {
      reject(ErrorCode.notInitialized, "SDK has not been initialized", nil)
      return
    }

    if registered {
      handshakeTokenBridge.client = self
      nativeClient.registerHandshakeAuthTokenProvider(
        { [weak self] in
          guard let self else {
            throw HandshakeProviderJSError(
              message: "The Lucra React Native bridge was torn down.")
          }
          return try await self.handshakeTokenBridge.requestToken()
        }, bypassTosAgreement: bypassTosAgreement)
    } else {
      nativeClient.registerHandshakeAuthTokenProvider(nil)
    }
    resolve(nil)
  }

  /// Signs in with the registered provider and resolves the authenticated user.
  ///
  /// The native call returns `Void`, but only once the profile has loaded, so
  /// reading `user` straight after is safe. Resolving `["user": ...]` keeps the
  /// payload identical to `submitVerificationCode`.
  @objc public func signInWithHandshakeAuth(
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    guard nativeClient != nil else {
      reject(ErrorCode.notInitialized, "SDK has not been initialized", nil)
      return
    }

    Task { @MainActor in
      do {
        try await self.nativeClient.signInWithHandshakeAuth()
        guard let user = self.nativeClient.user else {
          // The SDK waits for the profile before returning, so this is a
          // backstop rather than an expected outcome.
          reject(
            ErrorCode.unknownError,
            "Handshake sign-in completed but no user was available", nil)
          return
        }
        resolve(sdkUserToMap(user: user))
      } catch {
        self.rejectHandshakeAuthError(reject, error: error)
      }
    }
  }

  @objc public func resolveHandshakeAuthToken(_ requestId: String, token: String) {
    handshakeTokenBridge.resolve(requestId: requestId, token: token)
  }

  @objc public func rejectHandshakeAuthToken(_ requestId: String, message: String) {
    handshakeTokenBridge.reject(requestId: requestId, message: message)
  }

  @objc public func getAuthState(
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    guard nativeClient != nil else {
      reject(ErrorCode.notInitialized, "SDK has not been initialized", nil)
      return
    }

    Task { @MainActor in
      resolve(
        self.authStateMap(
          inFlight: self.nativeClient.isHandshakeAuthInFlight,
          error: self.nativeClient.handshakeAuthError,
          isResolving: self.nativeClient.isResolvingAuthState))
    }
  }

  private func authStateMap(
    inFlight: Bool, error: HandshakeAuthError?, isResolving: Bool
  ) -> [String: Any] {
    var map: [String: Any] = [
      "isHandshakeAuthInFlight": inFlight,
      "isResolvingAuthState": isResolving,
    ]
    if let error {
      let parts = handshakeAuthErrorParts(error)
      map["error"] = [
        "code": parts.code,
        "message": parts.message,
        "recoverySuggestion": parts.recoverySuggestion,
      ]
    } else {
      map["error"] = NSNull()
    }
    return map
  }

  // Codes mirror Android's rejectHandshakeAuthError so integrators see
  // identical rejections on both platforms. Android additionally has
  // `profileTimedOut`, which iOS's enum has no case for.
  private func rejectHandshakeAuthError(
    _ reject: RCTPromiseRejectBlock, error: Error
  ) {
    guard let handshake = error as? HandshakeAuthError else {
      reject(ErrorCode.unknownError, error.localizedDescription, error)
      return
    }
    let parts = handshakeAuthErrorParts(handshake)
    reject(
      parts.code, parts.message,
      NSError(
        domain: "LucraHandshakeAuth", code: 0,
        userInfo: [
          NSLocalizedDescriptionKey: parts.message,
          NSLocalizedRecoverySuggestionErrorKey: parts.recoverySuggestion,
          "recoverySuggestion": parts.recoverySuggestion,
        ]))
  }

  private func handshakeAuthErrorParts(
    _ error: HandshakeAuthError
  ) -> (code: String, message: String, recoverySuggestion: String) {
    let code: String
    switch error {
    case .noProviderRegistered:
      code = HandshakeAuthErrorCode.noProviderRegistered
    case .providerTimedOut:
      code = HandshakeAuthErrorCode.providerTimedOut
    case .providerFailed:
      code = HandshakeAuthErrorCode.providerFailed
    case .exchangeFailed:
      code = HandshakeAuthErrorCode.exchangeFailed
    case .tenantIdUnavailable:
      code = HandshakeAuthErrorCode.tenantIdUnavailable
    case .tosNotAccepted:
      code = HandshakeAuthErrorCode.tosNotAccepted
    @unknown default:
      code = ErrorCode.unknownError
    }
    return (
      code,
      error.errorDescription ?? "Handshake sign-in failed",
      error.recoverySuggestion ?? ""
    )
  }

  // Codes and messages mirror Android's rejectPhoneAuthError so integrators
  // see identical rejections on both platforms.
  private func rejectPhoneAuthError(
    _ reject: RCTPromiseRejectBlock, error: PhoneAuthError
  ) {
    let code: String
    let message: String
    switch error {
    case .notInitialized:
      code = ErrorCode.notInitialized
      message = "SDK has not been initialized"
    case .invalidPhoneNumber:
      code = PhoneAuthErrorCode.invalidPhoneNumber
      message = "The phone number provided is not a valid US phone number"
    case .phoneNumberNotSubmitted:
      code = PhoneAuthErrorCode.phoneNumberNotSubmitted
      message = "Submit a phone number before verifying or resending a code"
    case .invalidCode:
      code = PhoneAuthErrorCode.invalidCode
      message = "The verification code is invalid or incorrect"
    case .alreadyLoggedIn:
      code = PhoneAuthErrorCode.alreadyLoggedIn
      message = "The user is already logged in. Log out before starting phone authentication"
    case .messagingDisabled:
      code = PhoneAuthErrorCode.messagingDisabled
      message = "SMS messages from Lucra are disabled for this number. Reply START or UNSTOP to the verification sender, then try again"
    case .smsNotDelivered:
      code = PhoneAuthErrorCode.smsNotDelivered
      message = "The verification code could not be delivered to this phone number"
    case .tooManyAttempts:
      code = PhoneAuthErrorCode.tooManyAttempts
      message = "Too many attempts. Wait a few minutes before trying again"
    case .networkError(let details):
      code = PhoneAuthErrorCode.networkError
      message =
        details.isEmpty
        ? "A network error occurred during authentication" : details
    case .unknown:
      code = ErrorCode.unknownError
      message = "An unexpected error occurred during authentication"
    @unknown default:
      code = ErrorCode.unknownError
      message =
        error.errorDescription ?? "An unexpected error occurred during authentication"
    }
    reject(code, message, error)
  }

  // MARK: - Telemetry diagnostics

  @objc public func logTelemetry(
    _ level: String,
    message: String,
    category: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    guard nativeClient != nil else {
      reject(ErrorCode.notInitialized, "LucraSDK has not been initialized", nil)
      return
    }
    let log = LucraSDK.Resolver.resolve(LoggingService.self)
    switch level {
    case "info":
      log.info(message, category: category)
    case "warning":
      log.errorBreadcrumb(message, category: category)
    case "error":
      log.error(
        message, category: category,
        error: TelemetryDiagnosticError(message: message))
    default:
      reject("invalidTelemetryLevel", "Unknown telemetry level: \(level)", nil)
      return
    }
    resolve(nil)
  }

  // MARK: - Games matchup fee

  @objc public func getGamesMatchupFee(
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    DispatchQueue.main.async {
      guard self.nativeClient != nil else {
        reject(
          ErrorCode.notInitialized, "LucraSDK has not been initialized", nil)
        return
      }
      resolve(
        (self.nativeClient.api.gamesMatchupFee as NSDecimalNumber).doubleValue)
    }
  }

  @objc public func subscribeGamesMatchupFee() {
    DispatchQueue.main.async {
      self.gamesMatchupFeeTimer?.invalidate()
      self.lastEmittedGamesMatchupFee = nil

      guard self.nativeClient != nil else {
        self.delegate?.sendEvent(
          name: "gamesMatchupFee",
          result: [
            "error": [
              "code": ErrorCode.notInitialized,
              "message": "LucraSDK has not been initialized",
            ]
          ])
        return
      }

      self.emitGamesMatchupFeeIfChanged()
      // The iOS SDK exposes the fee only as a one-shot property (no
      // publisher), so poll for remote-config changes until cancelled.
      self.gamesMatchupFeeTimer = Timer.scheduledTimer(
        withTimeInterval: 2.0, repeats: true
      ) { [weak self] _ in
        self?.emitGamesMatchupFeeIfChanged()
      }
    }
  }

  @objc public func cancelGamesMatchupFeeSubscription() {
    DispatchQueue.main.async {
      self.gamesMatchupFeeTimer?.invalidate()
      self.gamesMatchupFeeTimer = nil
      self.lastEmittedGamesMatchupFee = nil
    }
  }

  private func emitGamesMatchupFeeIfChanged() {
    let fee = nativeClient.api.gamesMatchupFee
    guard fee != lastEmittedGamesMatchupFee else { return }
    lastEmittedGamesMatchupFee = fee
    delegate?.sendEvent(
      name: "gamesMatchupFee",
      result: ["fee": (fee as NSDecimalNumber).doubleValue])
  }
}
