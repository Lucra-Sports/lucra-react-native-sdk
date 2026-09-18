import Combine

/// One in-flight handshake token request, resumed exactly once — by whichever of the JS
/// answer and the SDK's 5s provider timeout gets there first — and dropping its
/// subscription with it.
final class PendingHandshakeToken: @unchecked Sendable {
  private let lock = NSLock()
  private var continuation: CheckedContinuation<String, Error>?
  private var pendingResult: Result<String, Error>?
  private var isSettled = false

  /// Held here so the subscription outlives the closure that created it.
  var cancellable: AnyCancellable?

  func attach(_ continuation: CheckedContinuation<String, Error>) {
    lock.lock()
    guard let pendingResult, !isSettled else {
      self.continuation = continuation
      lock.unlock()
      return
    }
    isSettled = true
    lock.unlock()
    settle(continuation, with: pendingResult)
  }

  func finish(_ result: Result<String, Error>) {
    lock.lock()
    guard !isSettled else {
      lock.unlock()
      return
    }
    // The task can already be cancelled by the time the suspension point is reached,
    // so buffer a result that arrives before there is a continuation to resume.
    guard let continuation else {
      pendingResult = result
      lock.unlock()
      return
    }
    isSettled = true
    self.continuation = nil
    lock.unlock()
    settle(continuation, with: result)
  }

  private func settle(
    _ continuation: CheckedContinuation<String, Error>, with result: Result<String, Error>
  ) {
    cancellable = nil
    continuation.resume(with: result)
  }
}

/// Whatever the JS provider reported, surfaced so the SDK can wrap it as
/// `HandshakeAuthError.providerFailed` with the original message intact.
struct HandshakeAuthTokenProviderError: LocalizedError {
  let message: String

  var errorDescription: String? { message }
}
