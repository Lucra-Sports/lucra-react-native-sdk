# UPCOMING
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
  * Added the `LucraSDK.startMiniGame(gameId, gameMode, amount?, matchupId?)` headless function. It starts a mini game session without presenting Lucra UI and returns a game `url`, `sessionId`, and optional `matchupId`. See [Mini Games headless functions](5.1_mini_games_headless.md).
  * Added `MiniGameMode` values for `PRACTICE`, `ONE_VS_ONE`, `FREE_FOR_ALL`, and `TOURNAMENT`.
  * Added the exported `MiniGameWebView` component for custom mini game presentation. It renders the URL from `startMiniGame` in a full-screen modal and handles game-to-native messages, close events, duplicate close protection, haptic feedback, and game log forwarding. See [Mini Games WebView](5.2_mini_games_webview.md).
  * Added Mini Games docs covering required peer dependencies: `react-native-webview >=13.0.0` and `react-native-haptic-feedback >=2.0.0`.
  * Documented `LucraSDK.preloadGeoToken(GeoComplyContext.CASH_BUY_IN)` as the recommended preload step before starting cash buy-in mini games.
  * Added the Lucra-managed `MINI_GAME` flow for teams that do not want to own the custom WebView presentation: `LucraSDK.present({ name: LucraSDK.FLOW.MINI_GAME, gameId, gameMode, amount?, matchupId? })`.
* Mapped the latest Minigames Headless SDK surface through the React Native library (TV-1637):
  * New headless functions: `getUserTournamentRewards`, `claimReward`, `markRewardViewed`, `getUserAchievements`, `claimAchievement`, `markAchievementViewed`. See [Rewards & Achievements headless functions](5.3_rewards_achievements_headless.md).
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
