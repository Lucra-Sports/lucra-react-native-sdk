import Foundation
import LucraSDK

/// Carries a JavaScript provider's rejection into the SDK's `providerFailed`
/// case. The SDK interpolates `errorDescription` into its own message, so the
/// integrator sees the error their own code threw.
struct HandshakeProviderJSError: LocalizedError {
  let message: String
  var errorDescription: String? { message }
}

/// Bridges the SDK's `async throws -> String` token provider onto the React
/// Native event bus.
///
/// The SDK calls `requestToken()`; this parks a continuation under a fresh
/// request id, fires `_handshakeAuthToken`, and waits for JS to answer with
/// `resolve(requestId:token:)` or `reject(requestId:message:)`.
///
/// Two properties are load-bearing:
///
/// * **Removal and resume are atomic.** `CheckedContinuation` *traps* on a
///   double resume, so two concurrent settles must never both obtain the same
///   continuation.
/// * **No timer of its own.** The SDK already bounds the provider at 5s and
///   cancels the task when it expires; `withTaskCancellationHandler` reaps the
///   continuation off that. A competing timer here would race the SDK's and
///   turn a real `providerTimedOut` into a misleading `providerFailed`.
final class HandshakeTokenBridge {
  private enum Slot {
    case waiting(CheckedContinuation<String, Error>)
    /// Cancellation arrived before the continuation was stored. Without this
    /// tombstone the body would park on a request nobody will ever settle.
    case cancelledBeforeParking
  }

  private let lock = NSLock()
  private var pending: [String: Slot] = [:]
  weak var client: LucraSwiftClient?

  func requestToken() async throws -> String {
    let requestId = UUID().uuidString
    // Guarantees no tombstone outlives the call it was minted for.
    defer { discard(requestId) }

    return try await withTaskCancellationHandler {
      try await withCheckedThrowingContinuation { continuation in
        lock.lock()
        if case .cancelledBeforeParking? = pending.removeValue(forKey: requestId) {
          lock.unlock()
          continuation.resume(throwing: CancellationError())
          return
        }
        guard let delegate = client?.delegate else {
          lock.unlock()
          continuation.resume(
            throwing: HandshakeProviderJSError(
              message: "The Lucra React Native bridge has no JavaScript listener attached."))
          return
        }
        pending[requestId] = .waiting(continuation)
        lock.unlock()
        delegate.sendEvent(name: "_handshakeAuthToken", result: ["requestId": requestId])
      }
    } onCancel: {
      // Cancellation can beat the parking above, so this one leaves a tombstone.
      settle(requestId, tombstoneIfMissing: true) {
        $0.resume(throwing: CancellationError())
      }
    }
  }

  func resolve(requestId: String, token: String) {
    // A stale or duplicate reply is dropped, never tombstoned — otherwise every
    // late reply would leak an entry.
    settle(requestId, tombstoneIfMissing: false) { $0.resume(returning: token) }
  }

  func reject(requestId: String, message: String) {
    settle(requestId, tombstoneIfMissing: false) {
      $0.resume(throwing: HandshakeProviderJSError(message: message))
    }
  }

  private func settle(
    _ requestId: String,
    tombstoneIfMissing: Bool,
    _ body: (CheckedContinuation<String, Error>) -> Void
  ) {
    lock.lock()
    let slot = pending.removeValue(forKey: requestId)
    if slot == nil && tombstoneIfMissing {
      pending[requestId] = .cancelledBeforeParking
    }
    lock.unlock()
    if case .waiting(let continuation)? = slot { body(continuation) }
  }

  private func discard(_ requestId: String) {
    lock.lock()
    pending.removeValue(forKey: requestId)
    lock.unlock()
  }
}
