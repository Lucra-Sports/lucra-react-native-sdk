# 6.0.0
* Bumped iOS to [6.0.1](https://github.com/Lucra-Sports/lucra-ios-sdk/releases/tag/6.0.1)
* Bumped Android to [7.0.0](https://github.com/Lucra-Sports/lucra-android-sdk/releases/tag/7.0.0)
* **Breaking (iOS, CocoaPods):** the Lucra iOS SDK now links Sentry's dynamic framework for its own diagnostics, and the wrapper's podspec declares the `Sentry` pod (8.58.4 or newer within 8.x). Apps on `use_frameworks! linkage: :static` build but die at launch with `dyld: Library not loaded: @rpath/Sentry.framework/Sentry` — build only the Sentry pod dynamically with the `pre_install` snippet in Getting Started, or switch to dynamic linkage. Apps that already use Sentry (e.g. `@sentry/react-native`) must align to `sentry-cocoa` 8.58.4+ within 8.x. See [Getting Started](1.0.0_project_setup.md#sentry-framework-linkage).
* **Android:** the Lucra Android SDK now depends on `io.sentry:sentry` 8.54.0. Apps that also use Sentry must resolve every `io.sentry:*` artifact to 8.54.0 or newer, or risk a launch crash (`Sentry SDK has detected a mix of versions`). See [Getting Started](1.0.0_project_setup.md#sentry-version-alignment-if-your-app-uses-sentry).
* Added `LucraSDK.logTelemetry({ level, message, category? }): Promise<void>` — records an `info`/`warning` breadcrumb or a non-fatal `error` event through the native Lucra SDK's built-in telemetry (Lucra's SDK Sentry project for the platform, using the DSN compiled into each native SDK; nothing reaches your own Sentry project). Exported the `LucraTelemetryLevel` type. The example app gained a "Telemetry Diagnostics" screen mirroring the iOS SDK Sample's. See [Headless Functionality](1.2.9_headless_interactions.md#telemetry-diagnostics).
* `LucraPhoneAuthError` gained three codes surfaced by the native SDKs' expanded phone-auth error handling: `messagingDisabled` (the user texted STOP to Lucra's verification sender and must reply START or UNSTOP before codes can be delivered), `smsNotDelivered`, and `tooManyAttempts`. These failures previously rejected with `unknownError`. See [Headless Functionality](1.2.9_headless_interactions.md#phone-authentication-headless).
* Bridged the headless phone-auth flow: `LucraSDK.submitPhoneNumber(phoneNumber)`, `LucraSDK.submitVerificationCode(code): Promise<LucraUser>`, and `LucraSDK.resendCode()`, matching the native iOS/Android SDKs. Phone numbers are normalized per platform by the new exported `formatUsPhoneNumber(input, 'formatted' | 'digits')` helper (`(XXX) XXX-XXXX` vs bare 10 digits; unparseable input passes through unchanged so the native SDK rejects it), and rejections use the new exported `LucraPhoneAuthError` type. See [Headless Functionality](1.2.9_headless_interactions.md#phone-authentication-headless).
* Added `LucraSDK.uploadUserAvatar(imageUri): Promise<void>` — uploads a new avatar for the current user from a local file/content uri, absolute path, or base64 `data:` uri; the `user` listener emits the updated user when the upload completes. See [Headless Functionality](1.2.9_headless_interactions.md#upload-user-avatar).
* Added `LucraSDK.updateUsername(username): Promise<LucraUser>` — updates only the current user's username and resolves with the updated user.
  * Android: uses the native `updateUsername`. iOS: the native SDK has no dedicated username call, so the bridge reconfigures the current user with only the username changed. See [Headless Functionality](1.2.9_headless_interactions.md#update-username).
* Added `LucraSDK.getUserKycStatus(userId): Promise<boolean>` — resolves whether a user has passed KYC verification. Android only: the iOS Lucra SDK has no headless KYC-status API yet, so iOS rejects with the new `unsupported` code (read `accountStatus` from `LucraSDK.getUser()` for the current user instead). See [Headless Functionality](1.2.9_headless_interactions.md#get-user-kyc-status).
* Bridged the games matchup service fee: `LucraSDK.getGamesMatchupFee(): Promise<number>` and `LucraSDK.subscribeToGamesMatchupFee(onChange, onError?)` (returns an unsubscribe function; fires immediately and again on changes).
  * Android: observes the native `observeGamesMatchupFee` flow. iOS: the native SDK exposes the fee only as a one-shot property, so the bridge polls for changes. See [GYP Headless Functions](2.3_gyp_headless_functions.md#get-games-matchup-fee).
* Added `LucraSDK.submitUserScore({ tournamentId, score, isFinal, metadata? }): Promise<PoolTournament | null>` — submits the user's tournament score and resolves with the updated tournament (`null` when iOS returns none). Fractional scores are accepted on both platforms. See [Tournament Headless Functions](3.3_tournaments_headless.md#submit-user-score).
* Added `LucraSDK.getTournamentDetails(tournamentId, { leaderboardLimit?, leaderboardOffset? }?): Promise<TournamentDetails>` — the lightweight `ui_tournament_details` payload behind Lucra's in-app tournament details screen (leaderboard, payout structure, attempt data, how-to-play, terms). Prefer it over `tournamentMatchup` for headless tournament UIs; the native SDKs deprecate the heavier call. Leaderboard pagination options (`leaderboardLimit`/`leaderboardOffset`) and the `expiresAt`/`startsAt` timestamps are available on both platforms. Exported the `TournamentDetails` type family. See [Tournament Headless Functions](3.3_tournaments_headless.md#get-tournament-details).

# 5.10.0
* Bumped iOS to [5.8.1](https://github.com/Lucra-Sports/lucra-ios-sdk/releases/tag/5.8.1)
* Bumped Android to [6.9.1](https://github.com/Lucra-Sports/lucra-android-sdk/releases/tag/6.9.1)
* Added light/dark mode support to `theme`. `theme.light` and `theme.dark` each take the six color keys; supplying both makes Lucra screens follow the device appearance and re-resolve live as it changes, supplying only one locks the SDK to that appearance. Flat color keys still work and still mean a single dark palette, so existing integrations are unaffected — no breaking change. Flat keys also act as a shared base that `light` and `dark` override, so you only repeat the tokens that differ. Exported `LucraTheme`, `LucraColorSet`, and `LucraFontFamily` types. See [Theming and Appearance](1.2.1_theming.md).
* Theme colors are now validated in JS before reaching the bridge: `#RGB` shorthand is expanded (Android rejected it outright), and unparseable values are dropped with a console warning instead of being silently ignored on iOS or throwing on Android. Note that 8-digit hex is `#AARRGGBB` — alpha first, not CSS's `#RRGGBBAA`.
* **Fix:** `onTournamentJoined` now also receives `gameId` (as a second, optional argument): `onTournamentJoined?: (id: string, gameId?: string) => void`. The native `tournamentJoined` event has always carried `gameId` alongside the tournament id, but the iOS and Android bridges were silently dropping it before it reached JS. No breaking change — existing single-argument listeners keep working.
* Added `allowRewardSheetToDisplay?: boolean` to `LucraSDKParams` (optional, defaults to `true`, matching native defaults). Controls the SDK's automatic "you've won a reward!" bottom sheet; set to `false` to globally suppress it. See [Reward Sheet](1.2.11_reward_sheet.md).
* Added `minigameEnabled?: boolean` to `LucraSDK.createRecreationalGame(gameTypeId, atStake, playStyle, minigameEnabled?)` (optional, defaults to `false`), matching the native iOS/Android SDKs. Pass `true` to apply the minigame-specific geo-compliance context instead of the standard games context.

# 5.9.0
* Bumped iOS to [5.7.0](https://github.com/Lucra-Sports/lucra-ios-sdk/releases/tag/5.7.0)
* Bumped Android to [6.8.0](https://github.com/Lucra-Sports/lucra-android-sdk/releases/tag/6.8.0)
* Added `handlePostNavigation?: boolean` to the `MINI_GAME` flow (`LucraSDK.present({ name: LucraSDK.FLOW.MINI_GAME, ... })`), matching the native iOS/Android SDKs. Defaults to `false`; when `true`, on a non-Practice/non-Tournament session end with a resolved matchup, the SDK automatically navigates to the Mini Games Matchup Details screen instead of dismissing. Previously this was silently hardcoded to `false` on iOS and omitted on Android — no behavior change for existing integrators who don't pass it. See [Mini Games Flows](6.3_mini_games_flows.md).

# 5.8.0
* Bumped iOS to [5.6.0](https://github.com/Lucra-Sports/lucra-ios-sdk/releases/tag/5.6.0)
* Bumped Android to [6.7.0](https://github.com/Lucra-Sports/lucra-android-sdk/releases/tag/6.7.0)
* Mapped the new Mini Games surface from the native SDKs' Minigames epic through the React Native library:
  * Added `LucraSDK.getMiniGames(): Promise<MiniGameCatalogItem[]>` — a headless function that lists every mini game enabled for the current tenant, each with the tenant's subscribed config options (mode, wager amount, group size). No Lucra UI is presented.
  * Added the exported `MiniGameCatalogItem` and `MiniGameCatalogConfig` TypeScript types describing the catalog response.
  * Added the Lucra-managed Mini Games flows, presented via `LucraSDK.present({ name: … })`:
    * `MINI_GAMES_HOME` — the Mini Games home experience (profile pill, achievement card, game carousel, featured tournament).
    * `MINI_GAMES_PROFILE` — the Mini Games profile (avatar, username, balance, stats, recent results).
    * `MINI_GAMES_REWARDS` — the Mini Games rewards screen (achievement rewards grouped by game).
    * `MINI_GAMES_MATCHUP_DETAILS` — the Mini Games matchup result screen (requires `matchupId`).
* Cross-platform parity: both Android and iOS expose the same Mini Games flows and return identical `MiniGameCatalogItem`/`MiniGameCatalogConfig` shapes.

# 5.7.0
* Added `autoJoin` boolean to `LucraSDKParams` (optional, defaults to `true`). When `true`, the SDK automatically joins all eligible free-entry tournaments as soon as the user authenticates. Set to `false` to suppress automatic joining and drive it yourself.
  * Passed through to `LucraClient.initialize(autoJoin:)` on Android and `LucraEnvironmentOverrides.init(autoJoin:)` on iOS. Both platforms previously hardcoded their own defaults (Android `true`, iOS `false`); the bridge now makes `true` the explicit cross-platform default.
* Added `LucraSDK.autoJoinTournaments(): Promise<string[]>` — a headless function to manually trigger the auto-join flow. Returns the IDs of all tournaments that were joined in that call. Useful when `autoJoin` is disabled at init time or when you want to re-run joining on demand (e.g., after a location permission grant). Rejects with a structured error code if prerequisites aren't met (location not granted, user unverified, feature disabled, etc.). The `onAutoJoinedTournaments` contest-listener event continues to fire alongside the promise resolution.
  * Android: unwraps `AutoJoinTournamentsResult.AutoJoinedTournamentsOutput.tournamentIds`
  * iOS: unwraps `Result<[String], TournamentError>` success value

# 5.6.0
* Bumped Android to [6.6.1](https://github.com/Lucra-Sports/lucra-android-sdk/releases/tag/6.6.1)
* Added `LucraSDK.handleLucraNotification(payload)` for push notifications: extracts the Lucra deeplink from a tapped
  notification's data payload and resolves it to `{ flow, matchupId, ... }` **without presenting UI**, so headless
  integrations can route to their own screens. See [Push Notifications](1.2.3_push_notifications.md).
* Added `LucraSDK.parseLucraLink(link)`: the headless counterpart to `handleLucraLink`, resolving a Lucra deeplink to
  flow info without presenting Lucra UI. See [Headless Deeplink Parsing](1.2.3_push_notifications.md#headless-deeplink-parsing).
* Added the exported `LucraFlowInfo` TypeScript type and the `extractLucraDeeplink(payload)` helper.
* Android: `registerDeviceTokenHex`/`registerDeviceTokenBase64` are now implemented (previously declared but missing);
  both forward the FCM token string to Lucra.
* Added the `LucraSDK.getMatchupDetails(matchupId)` function to retrieve detailed matchup information, including
  participant groups with scores and outcomes, and individual payouts.
  See [GYP headless functions](2.3_gyp_headless_functions.md#get-matchup-details).
* Added `LucraSDK.subscribeToMatchupDetails(matchupId, onResult, onError?)` to receive live updates when matchup details
  change. The callback fires immediately and whenever scores update or settlement occurs. Returns an `unsubscribe`
  function to cancel the subscription.
  See [Subscribe to Matchup Details](2.3_gyp_headless_functions.md#subscribe-to-matchup-details-live).
* Added the `useMatchupDetails(matchupId)` React hook for subscribing to matchup details within a component.
  Automatically unsubscribes when the component unmounts.
* `getMatchup` cross-platform parity fixes:
  * iOS: `status`, `type`, and `subtype` are now returned (previously dropped — Swift enums were not serializable across the bridge).
  * iOS: `tournamentLeaderboard` is no longer attached as a placeholder to participants of non-tournament matchups, and `place`/`placeOverride` are numbers (previously strings).
  * iOS: `socialConnectionId` now maps the actual field instead of repeating the user `id`.
  * Android: `participantGroups` is no longer empty (the underlying one-shot query skipped groups for unauthenticated requests; the matchup now resolves through the details query).
  * Breaking (Android): `type` and `subtype` now return canonical raw values matching iOS and the `MatchupType`/`MatchupSubtype` TypeScript unions — e.g. `RECREATIONAL_GAME` instead of `RecreationalGame`, `GROUP_VS_GROUP` instead of `GroupVsGroup`.

# 5.5.0
* Bumped iOS to [5.5.0](https://github.com/Lucra-Sports/lucra-ios-sdk/releases/tag/5.5.0)
* Bumped Android to [6.6.0](https://github.com/Lucra-Sports/lucra-android-sdk/releases/tag/6.6.0)
* Added tournament payout and reward metadata to `LucraSDK.tournamentMatchup(tournamentId)`:
  * `rewardType` identifies the raw tournament reward category, such as cash versus tenant-provided rewards.
  * `payoutStructure` exposes the same payout model used by native tournament details screens, including formatted labels, jackpot metadata, payout flags, and ordered reward rows.
  * Reward rows can include `catalogReward` details for tangible-prize tournaments without exposing redemption-only data such as discount codes, claim URLs, or free-item IDs.
* Added TypeScript exports for `PayoutStructure`, `PayoutReward`, and `CatalogReward` so apps can type tournament payout UI directly from the SDK response.
* Updated both Android and iOS mappers so the new tournament payout fields are returned consistently across platforms.
* Updated tournament headless docs with the new response fields, example payload, and type definitions.

# 5.4.1
* Empty state profile UI/UX fix for both iOS and Android
* Android geocomply issue fix

# 5.4.0
* Includes the Mini Games integration surface introduced during the 5.3.0 beta:
  * Added the `LucraSDK.startMiniGame(gameId, gameMode, amount?, matchupId?)` headless function. It starts a mini game session without presenting Lucra UI and returns a game `url`, `sessionId`, and optional `matchupId`. See [Mini Games headless functions](6.1_mini_games_headless.md).
  * Added `MiniGameMode` values for `PRACTICE`, `ONE_VS_ONE`, `FREE_FOR_ALL`, and `TOURNAMENT`.
  * Added the exported `MiniGameWebView` component for custom mini game presentation. It renders the URL from `startMiniGame` in a full-screen modal and handles game-to-native messages, close events, duplicate close protection, haptic feedback, and game log forwarding. See [Mini Games WebView](6.4_mini_games_webview.md).
  * Added Mini Games docs covering required peer dependencies: `react-native-webview >=13.0.0` and `react-native-haptic-feedback >=2.0.0`.
  * Documented `LucraSDK.preloadGeoToken(GeoComplyContext.CASH_BUY_IN)` as the recommended preload step before starting cash buy-in mini games.
  * Added the Lucra-managed `MINI_GAME` flow for teams that do not want to own the custom WebView presentation: `LucraSDK.present({ name: LucraSDK.FLOW.MINI_GAME, gameId, gameMode, amount?, matchupId? })`.
* Mapped the latest Minigames Headless SDK surface through the React Native library (TV-1637):
  * New headless functions: `getUserTournamentRewards`, `claimReward`, `markRewardViewed`, `getUserAchievements`, `claimAchievement`, `markAchievementViewed`. See [Rewards & Achievements](5.0_achievements.md).
  * New `ACHIEVEMENTS` flow exposed via `LucraSDK.present({ name: LucraSDK.FLOW.ACHIEVEMENTS })`.
  * New `onMiniGameFinished` contest-listener callback, forwarded from the native `MiniGame.Finished` event with `{ gameId, gameMode, amount, matchupId }`.
  * Added shared types: `LucraTournamentReward`, `LucraCatalogReward`, `LucraAchievement`, `LucraAchievementDefinition` (and criteria types).
* Android and iOS surfaces are at parity for all of the above.

# 5.2.0
* Bumped Android to [6.2.0](https://github.com/Lucra-Sports/lucra-android-sdk/releases/tag/6.2.0)
* Fixed Android `present` runtime parity: `LucraSDK.present(...)` now consistently returns a Promise and no longer resolves as `undefined` at runtime when chaining `.then(...)`.
* Fixed iOS `present` parameter mapping so `locationId` from React Native is forwarded correctly to native flow creation.
* Updated Kotlin to 2.2.20 to match the native Android SDK.
* Added explicit Kotlin Gradle Plugin version to the example app build config to prevent React Native's bundled KGP from overriding the required version.


# 5.1.0
* Bumped iOS to [5.1.0](https://github.com/Lucra-Sports/lucra-ios-sdk/releases/tag/5.1.0)
* Bumped Android to [6.1.0](https://github.com/Lucra-Sports/lucra-android-sdk/releases/tag/6.1.0)
* Critical configure user bug patched
* Added more clarity on tournament details UI so payouts per user and each ranking on the leaderboard has improved visibility.

# 5.0.1
* Fixed critical authentication regression, which preventing consistent token refresh after expiration.
* Bumped Android to [6.0.1](https://github.com/Lucra-Sports/lucra-android-sdk/releases/tag/6.0.1)
* Bumped iOS to [5.0.2](https://github.com/Lucra-Sports/lucra-ios-sdk/releases/tag/5.0.2)

## 5.0.0 (Please upgrade to 5.0.1)
* Major update - `apiKey` is now the only required key to initialize the client. Requires *new* apiKey to initialize the SDK. NOTE: Your existing apiKey will no longer work, please reach out to Lucra to get your new 'apiKey'.
* Introduced `HOME_PAGE` Flow, which is the same as `CREATE_GAMES_MATCHUP`.
* Breaking: Fonts must now be provided per-weight (normal/medium/semibold/bold). iOS uses PostScript names (e.g., `Inter Regular`), Android uses asset paths as before. Single `fontFamily` strings are no longer honored.
* Breaking: Theme colors trimmed to six supported keys: `primary`, `secondary`, `tertiary`, `onPrimary`, `onSecondary`, `onTertiary`. `background`, `surface`, `onBackground`, `onSurface` are ignored by the SDK and removed from RN examples.
* Breaking (headless error codes): normalized, lowercase codes across iOS & Android. Map your listeners accordingly:
  - **joinTournament / tournamentMatchup / recommendedTournaments** (TournamentError / FailedTournamentCall):
    - `APIError` → `apiError`
    - `LocationError` → `locationError` (message is user-facing text)
    - `unknown` → `unknownError`
    - User-state codes unchanged: `notInitialized`, `notAllowed`, `missingDemographicInformation`, `unverified`, `insufficientFunds`
  - **getMatchup**:
    - was `getMatchupFailure` with message `"apiError"` / `"locationError"`
    - now code is `apiError` / `locationError` directly, message is user-facing
    - user-state/custom errors can surface on iOS; Android currently surfaces API/Location only
  - **create/accept/cancel recreational games**: codes unchanged but now always lowercase and user-facing messages (`apiError`, `locationError`, user-state, `unknownError`).
* Action for integrators: update error handling to match the lowercase codes above; if you previously keyed on `"APIError"`, `"LocationError"`, `"unknown"`, or `"getMatchupFailure"`, switch to the new codes and consume the user-facing message payloads.
* Android 6.0.0 https://github.com/Lucra-Sports/lucra-android-sdk/releases/tag/6.0.0
* iOS 5.0.0 https://github.com/Lucra-Sports/lucra-ios-sdk/releases/tag/5.0.0

# 4.1.1
Hotfix off of 4.1.0 containing the iOS main thread initialization fix

This resolves the following

iOS system location permission prompts not showing as expected
