import Combine
import LucraSDK

class ConversionProvider: ConvertToCreditProvider {
  var outer: LucraSwiftClient
  init(outer: LucraSwiftClient) {
    self.outer = outer
  }

  func withdrawMethod(for amount: Decimal) async -> LucraSDK.CreditWithdrawal {
    var cancellable: AnyCancellable?
    let jsMap = await withCheckedContinuation { [weak outer] continuation in
      guard let outer else { return }

      cancellable = outer.creditConversionEmitter.sink { value in
        continuation.resume(returning: value)
        cancellable?.cancel()
        cancellable = nil
      }

      self.outer.delegate?.sendEvent(name: "_creditConversion", result: ["amount": amount])
    }

    let id = jsMap["id"] as! String
    let title = jsMap["title"] as! String
    let icon = jsMap["iconUrl"] as? String
    let conversionTerms = jsMap["conversionTerms"] as! String
    let convertedAmount = jsMap["convertedAmount"] as! Double
    let convertedDisplayAmount = jsMap["convertedAmountDisplay"] as! String
    let shortDescription = jsMap["shortDescription"] as! String
    let longDescription = jsMap["longDescription"] as! String

    let cardColorString = jsMap["cardColor"] as! String
    let cardColorTextString = jsMap["cardColorText"] as! String
    let pillColorString = jsMap["pillColor"] as! String
    let pillTextColorString = jsMap["pillColorText"] as! String
    //      let outlineColorString = jsMap["outlineColor"] as! String
    //      let glowColorString = jsMap["glowColor"] as! String
    //      let textColorString = jsMap["textColor"] as! String

    let theme = CreditWithdrawal.Theme(
      cardColor: cardColorString.color!, cardTextColor: cardColorTextString.color!,
      pillColor: pillColorString.color!, pillTextColor: pillTextColorString.color!
        //        outlineColor: outlineColorString.color!, glowColor: glowColorString.color!,
        //        textColor: textColorString.color!
    )

    let metadata = jsMap["metaData"]
    //
    //      let metadataJSON = try? JSONSerialization.data(withJSONObject: metadata!, options: [])
    //      let metadataString = String(data: metadataJSON ?? Data(), encoding: .utf8)

    let result = CreditWithdrawal(
      id: id,
      title: title,
      iconUrl: icon,
      theme: theme,
      conversionTerms: conversionTerms,
      convertedAmount: Decimal(convertedAmount),
      convertedDisplayAmount: convertedDisplayAmount,
      shortDescription: shortDescription,
      longDescription: longDescription,
      //        TODO: Test this, in theory metadata is a [String:Any] map
      metaData: metadata as? [String: String])

    return result
  }
}
