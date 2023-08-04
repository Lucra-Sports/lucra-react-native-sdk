import Foundation
import LucraSDK

@objc(LucraSdkMiddleware)
class LucraSdkMiddleware: NSObject {
    let lucraClient = LucraClient(config: .init(environment: .init(authenticationClientID: "VTa8LJTUUKjcaNFem7UBA98b6GVNO5X3",
                                                                   environment: .develop,
                                                                   urlScheme: "TODO:"),
                                                appearance: AlternateAppearance()))
    
    @objc func `helloWorld`() -> Void {
        DispatchQueue.main.async {
                   // Access and enumerate UIWindowScene windows here
                   UIViewController.topViewController?.present(lucraFlow: .profile, client: self.lucraClient, animated: true)
               }
        return
    }
}

import UIKit

extension UIViewController {

    static var topViewController: UIViewController? {
        getTopViewController()
    }

    func showSimpleAlert(title: String?, message: String?) {
        let alertController = UIAlertController(
            title: title,
            message: message,
            preferredStyle: .alert
        )

        let action = UIAlertAction(title: "Ok", style: .default)

        alertController.addAction(action)
        present(alertController, animated: true)
    }

    private static func getTopViewController(
        base: UIViewController? = UIApplication.shared.windows.first { $0.isKeyWindow }?.rootViewController) -> UIViewController? {
            if let nav = base as? UINavigationController {
                return getTopViewController(base: nav.visibleViewController)

            } else if let tab = base as? UITabBarController, let selected = tab.selectedViewController {
                return getTopViewController(base: selected)

            } else if let presented = base?.presentedViewController {
                return getTopViewController(base: presented)
            }
            return base
        }
}
private struct AlternateAppearance: UIKitAppearance {
    func color(_ font: LucraColor) -> UIColor? {
        switch font {
        case .lucraOrange:
            return .blue
        default:
            return nil
        }
    }
    
    func font(_ font: LucraFont) -> UIFont? {
        switch font {
        case .h1:
            return UIFont.systemFont(ofSize: 5)
        default:
            return nil
        }
    }
}
