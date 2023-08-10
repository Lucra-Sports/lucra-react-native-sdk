import Foundation
import LucraSDK

@objc enum LucraEnvironment: Int {
    case develop
    case staging
    case production
}

@objc enum LucraFlow: Int {
    case profile
}

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
    
    
    private static var currentInstance: LucraClient?
    
    @objc func getInstance() -> LucraClient {
        LucraClient.currentInstance!
    }
    
    @objc func createInstance(_ authenticationClientID: String, environment: String, urlScheme: String) -> LucraClient {
        // If already initialized just return last
        if let currentInstance = LucraClient.currentInstance {
            return currentInstance
        }

        config(authenticationClientID: authenticationClientID,
                      environment: environment,
                      urlScheme: urlScheme)
        LucraClient.currentInstance = self
        return self
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
}
