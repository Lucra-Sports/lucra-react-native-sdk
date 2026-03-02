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
