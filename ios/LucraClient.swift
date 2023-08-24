import Foundation
import LucraSDK

@objc(LucraClient)
class LucraClient: NSObject {
    @objc static func requiresMainQueueSetup() -> Bool { return true }

    private var nativeClient: LucraSDK.LucraClient!

    func config(authenticationClientID: String, environment: String, urlScheme: String) {

        let nativeEnvironment: LucraSDK.LucraEnvironment = {
            switch environment {
            case "develop":
                return .develop
            case "staging":
                return .staging
            case "production":
                return .production
            default:
                return .unknown
            }
        }()

        self.nativeClient = LucraSDK.LucraClient(
            config: .init(environment: .init(authenticationClientID: authenticationClientID,
                                             environment: nativeEnvironment,
                                             urlScheme: urlScheme)))
    }

    @objc func initialize(_ authenticationClientID: String, environment: String, urlScheme: String) {
        config(authenticationClientID: authenticationClientID,
                      environment: environment,
                      urlScheme: urlScheme)
    }

    @objc func present(_ lucraFlow: String) -> Void {
        DispatchQueue.main.async {
            let nativeFlow: LucraSDK.LucraFlow = {
                switch lucraFlow {
                case "profile":
                    return .profile
                case "addFunds":
                    return .addFunds
                default:
                    return .profile
                }
            }()

            UIViewController.topViewController?.present(lucraFlow: nativeFlow, client: self.nativeClient, animated: true)
        }
        return
    }


    @objc func createGamesMatchup(_ gameId: String,
                                  wagerAmount: NSNumber,
                                  resolver: @escaping RCTPromiseResolveBlock,
                                  rejecter: @escaping RCTPromiseRejectBlock) {
        Task { @MainActor in
            do {
                try await self.nativeClient.api.createGamesMatchup(gameId: gameId, atStake: wagerAmount.decimalValue)
                resolver(nil)
            } catch {
                rejecter("Lucra SDK Error - createGamesMatchupError", "\(error)", nil)
            }
        }
        
    }
    
    @objc func cancelGamesMatchup(_ gameId: String,
                                  resolver: @escaping RCTPromiseResolveBlock,
                                  rejecter: @escaping RCTPromiseRejectBlock) {
        Task { @MainActor in
            do {
                try await self.nativeClient.api.cancelGamesMatchup(id: gameId as String)
                resolver(nil)
            } catch {
                rejecter("Lucra SDK Error - cancelGamesMatchupError", "\(error)", nil)
            }
        }
    }
}
