---
name: lucra-react-native-start
description: >
  Entry point for integrating the Lucra React Native SDK. Use at the very start of any Lucra React
  Native integration, when install/build/initialization fails, or when unsure which Lucra flow or API
  to use. Routes by intent, verifies initialization, and troubleshoots common setup failures. Points to
  the official Lucra docs for all technical detail; contains no API reference of its own.
---

# Setup & Troubleshooting

## Step 0 — State the goal, then route

Establish what the integrator is trying to do, then jump to the matching guide. It helps to pin the
goal to one of these before writing integration code:

| Goal | Go to |
|---|---|
| First-time setup / install or build failing | this skill: "Install", then "Troubleshoot" |
| Expo managed workflow (config plugin, prebuild, Expo Go issues) | skill `lucra-react-native-expo` |
| Show Mini Games, or run games in your own WebView | skill `lucra-react-native-minigames` |
| Present any SDK screen (onboarding, profile, funds, matchups) | [Lucra Flows](../../1.2.7_lucraflows.md) |
| Auth / user state / configuring user properties | [Headless Functionality](../../1.2.9_headless_interactions.md) |
| Tournaments | [Tournaments Flows](../../3.1_tournaments_flows.md) |
| React to SDK events | [Lucra Event Listener](../../1.2.10_lucra_event_listener.md) |

## Install (start here)

The package is on **GitHub Packages, not the public npm registry** — this is the most common first
stumble:

- Create a GitHub Personal Access Token (classic, `read:packages` scope; add `repo` only if you also
  need private-repository access), then add a `.npmrc` with
  the token and the `@lucra-sports` registry mapping, and `npm i -s @lucra-sports/lucra-react-native-sdk`.
  Don't commit `.npmrc`.
- **iOS:** deployment target 15.1; add Lucra's private CocoaPods repo (`pod repo add LucraSDK …`) and
  both sources to the Podfile; `use_frameworks! linkage: :static`; disable Flipper; add the required
  Info.plist permission strings.
- **Android:** artifacts come from Maven Central (no auth); minSdk 24; Auth0 manifest placeholders
  (required even if you don't use Auth0); the GeoComply manifest block; provide the Lucra image loader
  in your `Application`.
- **Expo:** Expo Go is not supported — `expo prebuild` / dev client only, with `networkInspector: false`
  (the SDK ships libraries that block network inspection). For the full Expo path (config plugin,
  prebuild loop, fonts, Venmo entries), use skill `lucra-react-native-expo`.

Exact snippets for all of the above: [Project Setup](../../1.0.0_project_setup.md). A working reference
app lives in the repo: [`example/`](https://github.com/Lucra-Sports/lucra-react-native-sdk/tree/main/example)
(bare).

## Initialize

1. Call `LucraSDK.init({ apiKey, environment })` **once at app startup** and **await it** — init is
   asynchronous, and the resolved promise is your readiness signal. Gate all rendering/interaction with
   the SDK on it (the init doc shows the `isReady` state pattern). Use
   `LucraSDK.ENVIRONMENT.SANDBOX` for integration; the key must match the environment it was issued for.
2. Delegate auth by presenting `LucraSDK.FLOW.ONBOARDING` — the SDK provides the login UI, so you don't
   need to build one. Learn the result via `LucraSDK.getUser()` or `LucraSDK.addListener('user', …)`.

Detail + exact options (theme, `autoJoin`): [LucraSDK Initialization](../../1.2.0_initialize_client.md).

### Initialization checkpoints — worth verifying before you build features

- [ ] `npm install` succeeded against the GitHub Packages registry (no 401/404).
- [ ] Both platforms build and launch with the SDK linked (`pod install` clean on iOS; manifest merge clean on Android).
- [ ] `LucraSDK.init(…)` **resolved** (not just was called).
- [ ] The `environment` matches the one your API key was issued for.
- [ ] *(for signed-in features)* After presenting `ONBOARDING` and completing it, `LucraSDK.getUser()` returns a user.

If any of these don't hold, the Troubleshoot section below covers the common causes.

## Troubleshoot (symptom → check → doc)

| Symptom | First thing to check | Reopen |
|---|---|---|
| `npm install` 401/404 on `@lucra-sports/...` | `.npmrc` missing or PAT lacks the `read:packages` scope — the package is on GitHub Packages, not public npm | [Project Setup](../../1.0.0_project_setup.md) |
| `pod install` can't find the Lucra pod | Private pod repo not added (`pod repo add LucraSDK …`) or Podfile missing the two `source` lines | [Project Setup](../../1.0.0_project_setup.md) |
| Android manifest merger failure mentioning `auth0Domain`/`auth0Scheme` | Auth0 manifest placeholders missing from `defaultConfig` | [Project Setup](../../1.0.0_project_setup.md) |
| Presenting a flow does nothing / rejects | Was `LucraSDK.init(…)` awaited to resolution first? Flows and headless calls only work after init resolves | [Initialization](../../1.2.0_initialize_client.md) |
| Auth/unauthorized-style failures | Key/environment mismatch (e.g. sandbox key with `ENVIRONMENT.PRODUCTION`) | [Initialization](../../1.2.0_initialize_client.md) |
| `getUser()` fails / `'user'` listener never fires with a user | Did the `ONBOARDING` flow actually complete? Network reachable? | [Headless Functionality](../../1.2.9_headless_interactions.md) |
| Headless call rejects with a structured code (`unverified`, `insufficientFunds`, …) | Route the code to its matching flow (verify identity, add funds, demographics) per the error-handling pattern | [Headless Functionality](../../1.2.9_headless_interactions.md) |
| A Mini Games flow renders empty / reports unavailable | Mini Games must be enabled for your tenant on the backend | skill `lucra-react-native-minigames` |
| App crashes or misbehaves with a network inspector attached | The SDK ships libraries that block network inspection — set `networkInspector: false` (Expo) / disable Flipper | [Project Setup](../../1.0.0_project_setup.md) |

## Definition of "initialized successfully"

The SDK is initialized once both platforms build against the package and `LucraSDK.init(…)` has
**resolved** — at that point you can present flows and call headless APIs.

For features that require an authenticated user, add one more checkpoint: after presenting
`ONBOARDING`, confirm `LucraSDK.getUser()` returns a user.
