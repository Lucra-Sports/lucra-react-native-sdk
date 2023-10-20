import Foundation
import LucraSDK

@objc(LucraClient)
class LucraClient: NSObject {
    @objc static func requiresMainQueueSetup() -> Bool { return true }
    
    private var nativeClient: LucraSDK.LucraClient!
    
    @objc func initialize(_ options: Dictionary<String, Any>,
                          resolver: @escaping RCTPromiseResolveBlock,
                          rejecter: @escaping RCTPromiseRejectBlock) {
        guard nativeClient == nil else { return }
        
        guard let authenticationClientID = options["authenticationClientId"] as? String else {
            rejecter("Lucra SDK Error", "no clientAuthenticationId passed to LucraSDK constructor", nil)
            return
        }
        
        let environment = options["environment"] as? String ?? "develop"
        
        var clientTheme = ClientTheme()
        
        if let theme = options["theme"] as? Dictionary<String, Any> {
            let background = theme["background"] as? String
            let surface = theme["surface"]  as? String
            let primary = theme["primary"]  as? String
            let secondary = theme["secondary"]  as? String
            let tertiary = theme["tertiary"]  as? String
            let onBackground = theme["onBackground"]  as? String
            let onSurface = theme["onSurface"]  as? String
            let onPrimary = theme["onPrimary"]  as? String
            let onSecondary = theme["onSecondary"]  as? String
            let onTertiary = theme["onTertiary"]  as? String
            let fontFamilyName = theme["fontFamilyName"]  as? String
            
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
        
        self.nativeClient = LucraSDK.LucraClient(
            config: .init(environment: .init(authenticationClientID: authenticationClientID,
                                             environment: nativeEnvironment,
                                             urlScheme: ""),
                          appearance: clientTheme))
    }
    
    @objc func present(_ lucraFlow: String) -> Void {
        DispatchQueue.main.async {
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
                default:
                    assertionFailure("Unimplemented lucra flow \(lucraFlow)")
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
                let result = try await self.nativeClient.api.createGamesMatchup(gameTypeId: gameId, atStake: wagerAmount.decimalValue)
                
                resolver([
                    "matchupId": result.matchupId,
                    "ownerTeamId": result.ownerTeamId,
                    "oponnentTeamId": result.opponentTeamId
                ])
            } catch {
                rejecter("\(error)", error.localizedDescription, nil)
            }
        }
        
    }
    
    @objc func acceptGamesMatchup(_ matchupId: String,
                                  teamId: String,
                                  resolver: @escaping RCTPromiseResolveBlock,
                                  rejecter: @escaping RCTPromiseRejectBlock) {
        Task { @MainActor in
            do {
                try await self.nativeClient.api.acceptGamesMatchup(matchupId: matchupId, teamId: teamId)
                resolver(nil)
            } catch {
                rejecter("\(error)", error.localizedDescription, nil)
            }
        }
    }
    
    @objc func cancelGamesMatchup(_ gameId: String,
                                  resolver: @escaping RCTPromiseResolveBlock,
                                  rejecter: @escaping RCTPromiseRejectBlock) {
        Task { @MainActor in
            do {
                try await self.nativeClient.api.cancelGamesMatchup(matchupId: gameId as String)
                resolver(nil)
            } catch {
                rejecter("\(error)", error.localizedDescription, nil)
            }
        }
    }
}
