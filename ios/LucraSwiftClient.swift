import Combine
import Foundation
import LucraSDK

@objc
public class LucraSwiftClient: NSObject {
    private var nativeClient: LucraSDK.LucraClient!
    private var userCallback: RCTResponseSenderBlock?
    private var userSinkCancellable: AnyCancellable?

    @objc
    public func initialize(_ options: [String: Any],
                           resolver: @escaping RCTPromiseResolveBlock,
                           rejecter: @escaping RCTPromiseRejectBlock)
    {
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

            clientTheme = ClientTheme(background: background,
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
        resolver(nil)
    }

    @objc
    public func registerUserCallback(_ cb: @escaping RCTResponseSenderBlock) {
        userCallback = cb
        userSinkCancellable = nativeClient.user.publisher.sink { user in
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

            cb([[
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
            ]])
        }
    }

    @objc
    public func configureUser(_ user: [String: Any], resolver: @escaping RCTPromiseResolveBlock,
                              rejecter: @escaping RCTPromiseRejectBlock) {
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
                resolver(nil)
            } catch {
                rejecter("Lucra SDK Error", "\(error)", nil)
            }
        }
        
    }

    @objc
    public func present(_ lucraFlow: String) {
        DispatchQueue.main.async {
            // TODO(osp) LucraFlow is missing MyMatchup on iOS
            let nativeFlow: LucraSDK.LucraFlow = {
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
                case "withdrawFunds":
                    return .withdrawFunds
                case "publicFeed":
                    return .publicFeed
                default:
                    assertionFailure("Unimplemented lucra flow \(lucraFlow)")
                    return .profile
                }
            }()

            UIViewController.topViewController?.present(
                lucraFlow: nativeFlow,
                client: self.nativeClient,
                animated: true
            )
        }
    }

    @objc
    public func createGamesMatchup(_ gameId: String,
                                   wagerAmount: Double,
                                   resolver: @escaping RCTPromiseResolveBlock,
                                   rejecter: @escaping RCTPromiseRejectBlock)
    {
        Task { @MainActor in
            do {
                let result = try await
                    self.nativeClient.api.createGamesMatchup(
                        gameTypeId: gameId,
                        atStake: Decimal(floatLiteral: wagerAmount)
                    )

                resolver([
                    "matchupId": result.matchupId,
                    "ownerTeamId": result.ownerTeamId,
                    "oponnentTeamId": result.opponentTeamId,
                ])
            } catch {
                rejecter("\(error)", error.localizedDescription, nil)
            }
        }
    }

    @objc
    public func acceptGamesMatchup(_ matchupId: String,
                                   teamId: String,
                                   resolver: @escaping RCTPromiseResolveBlock,
                                   rejecter: @escaping RCTPromiseRejectBlock)
    {
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
    public func cancelGamesMatchup(_ gameId: String,
                                   resolver: @escaping RCTPromiseResolveBlock,
                                   rejecter: @escaping RCTPromiseRejectBlock)
    {
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
}
