import Combine
import LucraSDK

@objc public protocol LucraClientDelegate {
  func sendEvent(name: String, result: [String: Any])
}

@objc
public class LucraSwiftClient: NSObject {

  @objc weak public var delegate: LucraClientDelegate? = nil
  private var nativeClient: LucraSDK.LucraClient!
  private var userCallback: RCTResponseSenderBlock?
  private var userSinkCancellable: AnyCancellable?

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
    guard nativeClient == nil else { return }

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
      let fontFamilyName = theme["fontFamilyName"] as? String

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
        onTertiary: onTertiary,
        fontFamilyName: fontFamilyName)
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
          urlScheme: "",
          merchantID: merchantID
        ),
        appearance: clientTheme
      )
    )

    // immediately create event emitter for user value
    userSinkCancellable = nativeClient.$user.sink { user in
      guard let user = user else {
        self.delegate?.sendEvent(name: "user", result: ["user": nil])
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
        ]
      ]

      self.delegate?.sendEvent(name: "user", result: userMap)
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
      address: sdkAddress
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

  @objc
  public func getUser(
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {

    switch nativeClient.user {
    case .some(let user):
      var userJS: [String: Any] = [
        "username": user.username!,
        "avatarURL": user.avatarURL!,
        "phoneNumber": user.phoneNumber!,
        "email": user.email!,
        "firstName": user.firstName!,
        "lastName": user.lastName!,
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

  private func getLucraFlow(_ lucraFlow: String, matchupId: String?, teamInviteId: String?) -> LucraSDK.LucraFlow {
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
      return .createGamesMatchup
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

  @objc
  public func present(_ lucraFlow: String, matchupId: String?, teamInviteId: String?) {
    DispatchQueue.main.async {
      let nativeFlow = self.getLucraFlow(lucraFlow, matchupId: matchupId, teamInviteId: teamInviteId)
      UIViewController.topViewController?.present(
        lucraFlow: nativeFlow,
        client: self.nativeClient,
        animated: true
      )
    }
  }

  @objc
  public func createGamesMatchup(
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

  @objc
  public func getGamesMatchup(
    _ gameId: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    Task {
      do {
        let match = try await self.nativeClient.api.gamesMatchup(for: gameId)
        // All the values inside the teams will always be the same, so map to the first available value
        let wagerAmount = match?.teams[0].wagerAmount ?? 0

        if let match {
          resolve([
            "id": match.id,
            "createdAt": match.createdAt.toString(),
            "updatedAt": match.updatedAt.toString(),
            "status": match.status.rawValue,
            "isArchive": match.isArchive,
            "wagerOpponentTeamIdAmount": wagerAmount,
            "teams": match.teams.map { team in
              return [
                "id": team.id,
                "outcome": team.outcome?.rawValue as Any,
                "users": team.users.map { user in
                  return [
                    "id": user.id,
                    "username": user.user.username,
                  ]
                },
              ]
            },
          ])
        } else {
          resolve(nil)
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

  @objc public func getFlowController(_ flow: String) -> UIViewController {
    let nativeFlow = getLucraFlow(flow, matchupId: nil, teamInviteId: nil)
    return self.nativeClient.ui.flow(nativeFlow, hideCloseButton: true)
  }

  @objc public func getProfilePill() -> UIView {
    return self.nativeClient.ui.component(.userProfilePill)
  }

  @objc public func getMiniFeed(_ userIDs: [String]?) -> UIView {
    return self.nativeClient.ui.component(.miniPublicFeed(playerIDs: userIDs))
  }
    
    @objc public func getCreateContestButton() -> UIView {
        return self.nativeClient.ui.component(.createContestButton)
    }
    
    @objc public func getRecommendedMatchup() -> UIView {
        return self.nativeClient.ui.component(.recommendedMatchup)
    }
    
    @objc public func getContestCard(_ contestId: String) -> UIView {
        return self.nativeClient.ui.component(.contestCard(contestId: contestId))
    }
}
