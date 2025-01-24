import LucraSDK

class ErrorMapper {
  static func rejectUserStateError(_ reject: @escaping RCTPromiseRejectBlock, error: LucraSDK.UserStateError) {
    switch error {
    case .insufficientFunds:
        reject("insufficientFunds", "User has insufficient funds", nil);
    case .notAllowed:
        reject("notAllowed", "User is not allowed to perform such operation", nil);
    case .notInitialized:
        reject("notInitialized", "User has not been initialized", nil);
    case .unverified:
        reject("unverified", "User has not been verified", nil);
    @unknown default:
        reject("unknown", "Uknown error", nil);
    }
  }

  static func reject(
    _ reject: @escaping RCTPromiseRejectBlock, error: any Error
  ) {
    if let error = error as? LucraSDK.UserStateError {
      rejectUserStateError(reject, error: error)
    } else {
      reject("\(error)", error.localizedDescription, nil)
    }
  }
}
