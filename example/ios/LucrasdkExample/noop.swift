// Intentionally empty.
//
// The example app target is otherwise pure Objective-C. It statically links
// Swift frameworks (LucraSDK, Auth0, Firebase) that auto-link the Swift
// back-deployment compatibility libraries (swiftCompatibility56,
// swiftCompatibilityConcurrency, swiftCompatibilityPacks) and SwiftUICore.
//
// Without at least one Swift file, Xcode does not configure the Swift toolchain
// link paths for the target, causing linker errors like:
//   ld: Could not find or use auto-linked library 'swiftCompatibility56'
//   ld: cannot link directly with 'SwiftUICore' because product being built is
//       not an allowed client of it
//
// This empty file makes the target a Swift client and fixes those link errors.
import Foundation
