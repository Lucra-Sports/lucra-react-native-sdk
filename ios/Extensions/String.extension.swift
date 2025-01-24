import Foundation
import SwiftUI

extension String {

  /// Create `Data` from hexadecimal string representation
  ///
  /// This creates a `Data` object from hex string. Note, if the string has any spaces or non-hex characters (e.g. starts with '<' and with a '>'), those are ignored and only hex characters are processed.
  ///
  /// - returns: Data represented by this hexadecimal string.

  var hexadecimal: Data? {
    var data = Data(capacity: count / 2)

    let regex = try! NSRegularExpression(pattern: "[0-9a-f]{1,2}", options: .caseInsensitive)
    regex.enumerateMatches(in: self, range: NSRange(startIndex..., in: self)) { match, _, _ in
      let byteString = (self as NSString).substring(with: match!.range)
      let num = UInt8(byteString, radix: 16)!
      data.append(num)
    }

    guard data.count > 0 else { return nil }

    return data
  }
  var color: Color? {
    guard let hexData = hexadecimal else { return nil }
    return Color(
      red: Double(hexData[0]) / 255.0, green: Double(hexData[1]) / 255.0,
      blue: Double(hexData[2]) / 255.0, opacity: 1.0)
  }

}
