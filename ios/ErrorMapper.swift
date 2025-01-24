import LucraSDK

class ErrorMapper {
    static func getErrorDescription(_ error: LucraSDK.UserStateError) ->  String {
        switch error {
        case .insufficientFunds:
            return "Insufficient Funds"
        case .notAllowed:
            return "Not Allowed"
        case .notInitialized:
            return "Not Initialized"
        case .unverified:
            return "Unverified"
        @unknown default:
            return "Unknown Error, contact support"
        }
    }
    
    static func reject(_ reject: @escaping RCTPromiseRejectBlock, error: any Error) {
        if let error = error as? LucraSDK.UserStateError {
            reject("ERROR", getErrorDescription(error), nil)
        } else {
            reject("ERROR", error.localizedDescription, nil)
        }
    }
}
