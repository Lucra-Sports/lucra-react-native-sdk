---
name: lucra-react-native-expo
description: >
  Integrate the Lucra React Native SDK in an Expo managed-workflow app (config plugin + prebuild).
  Use when the target app is Expo, when Expo Go fails with Lucra, or for prebuild/dev-client/build
  issues specific to Expo. Covers what the Lucra config plugin automates vs what you still configure.
  Points to the official Lucra docs for all technical detail.
---

# Expo Managed Workflow

**Prerequisite:** everything in `lucra-react-native-start` still applies — the GitHub Packages PAT +
`.npmrc`, `LucraSDK.init(...)` awaited as the readiness signal, delegated auth. This skill covers only
what Expo changes about *setup*; initialization and all feature work are identical to the bare workflow.

## The one Expo rule

**Expo Go is not supported.** The SDK ships native code (GeoComply, Auth0, payments), so the app must
be compiled: use `npx expo prebuild` + `npx expo run:ios|android`, an `expo-dev-client` build, or a
standalone build. If someone reports "it crashes/fails in Expo Go," that is expected — move them to a
compiled workflow first.

## What the config plugin does for you

Register two plugins in `app.config.js` and the native host contract is applied automatically at
prebuild — you don't hand-edit native files:

1. `expo-build-properties` — with iOS `deploymentTarget: '15.1'`, Android `minSdkVersion: 24`, and
   `networkInspector: false` on **both** platforms (the SDK ships libraries that block network
   inspection; leaving the inspector on breaks the app).
2. `'@lucra-sports/lucra-react-native-sdk'` — the Lucra config plugin. During prebuild it applies what
   the bare-workflow setup doc has you do by hand: Android permissions, Auth0 manifest placeholders,
   the GeoComply receivers/services, the extra Maven repository, and the iOS Podfile/Info.plist/
   AppDelegate modifications.

Exact snippets: [Project Setup → Expo](../../1.0.0_project_setup.md).

## What you still configure yourself

- **Fonts:** the SDK theme's `fontFamily` needs your fonts loaded via `expo-font`, with all four
  variations (Regular, Medium, SemiBold, Bold). Naming differs per platform — Android takes paths
  relative to `fonts/`, iOS takes the font family name. → [Project Setup → Custom Fonts](../../1.0.0_project_setup.md)
- **Venmo (if you enable Venmo payments):** the `CFBundleURLTypes` (`<bundle-id>.venmo`) and
  `LSApplicationQueriesSchemes` entries go in `app.config.js` → `ios.infoPlist`. → [Project Setup → Venmo Deeplinks (Expo)](../../1.0.0_project_setup.md)
- **The PAT/.npmrc** for GitHub Packages — Expo doesn't change how the package is fetched.

## The working loop

1. `.npmrc` with the PAT → install the SDK package.
2. Register the two plugins in `app.config.js`.
3. `npx expo prebuild --clean` — re-run this **every time** the plugin config changes; stale native
   projects are the most common source of "I changed the config and nothing happened."
4. `npx expo run:ios` / `npx expo run:android` (or a dev-client build — keep `networkInspector: false`).
5. From here, follow `lucra-react-native-start` → Initialize (await `LucraSDK.init`, present
   `ONBOARDING`), and `lucra-react-native-minigames` for Mini Games.

> **Standalone/EAS builds:** there is no Lucra-specific EAS documentation today. The config-plugin
> path above is the whole contract, so a standard EAS build that runs prebuild should behave the same —
> but don't invent EAS-specific steps; if an EAS-only failure appears, treat it as a native-setup
> checklist item (plugin registered? prebuild ran? PAT available to the build?) and escalate to Lucra
> if it persists.

## Troubleshoot (symptom → check → doc)

| Symptom | First thing to check | Reopen |
|---|---|---|
| Crashes / fails to load in Expo Go | Expected — Expo Go is unsupported. Use prebuild/dev-client/standalone | [Project Setup → Expo](../../1.0.0_project_setup.md) |
| Config change had no effect | `npx expo prebuild --clean` not re-run after editing `app.config.js` | [Project Setup → Expo](../../1.0.0_project_setup.md) |
| Native build missing permissions / Auth0 placeholder / GeoComply errors | The Lucra config plugin isn't registered in `plugins` (it applies those at prebuild) | [Project Setup → Expo](../../1.0.0_project_setup.md) |
| App misbehaves with dev tools attached | `networkInspector` not set to `false` in `expo-build-properties` (both platforms) | [Project Setup → Expo](../../1.0.0_project_setup.md) |
| Lucra UI renders with wrong/system fonts | `expo-font` not loading all four variations, or wrong per-platform `fontFamily` naming | [Project Setup → Custom Fonts](../../1.0.0_project_setup.md) |
| `npm install` 401/404 on `@lucra-sports/...` | Same PAT/.npmrc requirement as bare workflow | skill `lucra-react-native-start` |
| Everything builds, SDK calls fail | This is no longer an Expo problem — go to `lucra-react-native-start` → Troubleshoot | skill `lucra-react-native-start` |
