import Combine
import LucraSDK

class RewardProvider: AnyObject {
  var outer: LucraSwiftClient
  init(outer: LucraSwiftClient) {
    self.outer = outer
  }
}

extension RewardProvider: LucraSDK.LucraRewardProvider {
  func viewRewards() {
    // TODO: bind to RN
  }

  func availableRewards() async -> [LucraSDK.LucraReward] {
    var cancellable: AnyCancellable?
    let rewards = await withCheckedContinuation { [weak outer] continuation in
      guard let outer else { return }

      cancellable = outer.rewardEmitter.sink { value in
        continuation.resume(returning: value)
        cancellable?.cancel()
        cancellable = nil
      }

      self.outer.delegate?.sendEvent(name: "_availableRewards", result: [:])
    }

    return rewards.map { reward in
      return LucraReward(
        rewardId: reward["rewardId"] as! String,
        title: reward["title"] as! String,
        descriptor: reward["descriptor"] as! String,
        iconUrl: reward["iconUrl"] as! String,
        bannerIconUrl: reward["bannerIconUrl"] as? String,
        disclaimer: reward["disclaimer"] as? String,
        metadata: reward["metadata"] as? [String: String])
    }

  }

  func claimReward(reward: LucraSDK.LucraReward) {
    let reward = [
      "rewardId": reward.rewardId as Any,
      "title": reward.title as Any,
      "descriptor": reward.descriptor as Any,
      "iconUrl": reward.iconUrl as Any,
      "bannerIconUrl": reward.bannerIconUrl as Any,
      "disclaimer": reward.disclaimer as Any,
      "metadata": reward.metadata as Any,
    ]
    self.outer.delegate?.sendEvent(name: "_claimReward", result: reward)
  }
}
