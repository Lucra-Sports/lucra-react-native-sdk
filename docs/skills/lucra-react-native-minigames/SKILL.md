---
name: lucra-react-native-minigames
description: >
  Integrate Lucra Mini Games in React Native — both the SDK-rendered UI flows (Mini Games Home, a full
  managed game session, profile, rewards, matchup details) and the headless path (catalog fetch, session
  start, rendering the game in the provided MiniGameWebView). Use once the Lucra React Native SDK is
  initialized (`LucraSDK.init` resolved). Points to the official docs for exact signatures.
---

# Mini Games Integration

**Prerequisite:** the `lucra-react-native-start` "initialized successfully" bar is met —
`LucraSDK.init(…)` has resolved. Sign-in is required for user-scoped actions (starting non-practice
sessions, entering matchups); the SDK routes through authentication when needed.

**Peer dependencies:** Mini Games additionally requires `react-native-webview` (>=13.0.0) and
`react-native-haptic-feedback` (>=2.0.0) — install these before anything renders. →
[Mini Games](../../5.0.0_mini_games.md)

**Tenant note:** the catalog and modes are tenant-driven. If Mini Games renders empty or reports
unavailable, the first thing to check is that Mini Games are enabled for your tenant.

## Choose your integration style

- Want Lucra's screens as-is, fastest path → **UI flows**.
- Want your own catalog/launcher UI and control of the game surface → **Headless + `MiniGameWebView`**.
- Mixed is the norm: headless powers *your* launcher, a flow handles the interactive/details parts.

## Product vocabulary → API

| Product term | Maps to |
|---|---|
| "Practice" | `MiniGameMode.PRACTICE` (no wager; `amount` is ignored) |
| "Battle Mode" / 1v1 | `MiniGameMode.ONE_VS_ONE` |
| "Free for all" | `MiniGameMode.FREE_FOR_ALL` |
| "Tournament entry" | `MiniGameMode.TOURNAMENT` |
| A game's id | `gameId` string, e.g. `'hoops-web'`, `'runaway-web'`, `'tappysoccer-web'` |

## UI flows

You present an SDK screen; it renders and navigates itself. Via `LucraSDK.present({ name: … })`:

- `MINI_GAMES_HOME` — the hub (profile pill, achievement card, game carousel, featured tournament). No params.
- `MINI_GAME` — the full Lucra-managed game session (loading → in-game WebView). Params:
  `gameId` + `gameMode` required, `amount`/`matchupId` optional. UI counterpart of headless `startMiniGame`.
- `MINI_GAMES_PROFILE` — the user's Mini Games profile. No params.
- `MINI_GAMES_REWARDS` — achievement rewards grouped by game. No params.
- `MINI_GAMES_MATCHUP_DETAILS` — a mini game matchup's result screen. Requires `matchupId`.

Exact signatures + all flows: [Lucra Flows](../../1.2.7_lucraflows.md). Dismiss programmatically with
`LucraSDK.closeFullScreenLucraFlows()`.

### UI checkpoints

- [ ] Presenting `MINI_GAMES_HOME` after init resolves shows Lucra UI, not a blank screen (tenant provisioned?).
- [ ] Dismissal returns control to your app (the flow-dismissed listener fires).

## Headless (your UI, Lucra's session)

- **Catalog:** `LucraSDK.getMiniGames()` returns every game enabled for the tenant with its config
  options (mode, wager, group size) — build your own catalog/launcher from it. →
  [Mini Games Headless](../../5.1_mini_games_headless.md)
- **Pre-warm geo:** call `LucraSDK.preloadGeoToken(GeoComplyContext.…)` early (e.g. when your game
  screen mounts) so the token is cached before start. → [Mini Games](../../5.0.0_mini_games.md)
- **Start a session:** `LucraSDK.startMiniGame(gameId, gameMode, amount?, matchupId?)` returns
  `{ url, sessionId, matchupId? }`. → [Mini Games Headless](../../5.1_mini_games_headless.md)
- **Render the game:** pass `url` to the provided `MiniGameWebView` component (full-screen modal,
  haptics, close handling built in; visible while `url` is non-null). →
  [Mini Games WebView](../../5.2_mini_games_webview.md)
- **Handle errors by code:** `startMiniGame` rejects with structured codes — route each to its flow
  (`insufficientFunds` → `ADD_FUNDS`, `unverified` → `VERIFY_IDENTITY`,
  `missingDemographicInformation` → `DEMOGRAPHIC_COLLECTION`, `locationError` → prompt for location).
  The headless doc has the full switch. → [Mini Games Headless](../../5.1_mini_games_headless.md)

### Headless checkpoints

- [ ] `getMiniGames()` returns a non-empty catalog for a provisioned tenant.
- [ ] `startMiniGame` in `PRACTICE` mode returns a `url` (no wager prerequisites) and it loads in `MiniGameWebView`.
- [ ] Error codes route to the matching flow rather than dead-ending.

## The bridge (the thing docs don't say in one place)

The intended shape: your launcher UI (from `getMiniGames()`) → `preloadGeoToken` on mount →
`startMiniGame` on tap → `MiniGameWebView` renders the session → on close, present the matchup details
flow with the returned `matchupId` — but only when one came back, since `matchupId` is optional on
`StartMiniGameResult` and `MINI_GAMES_MATCHUP_DETAILS` requires it. **Timing matters at the seam:**
after the WebView modal closes, wait ~1000ms (`setTimeout`) before presenting the details flow —
presenting immediately races the modal dismissal and the flow silently fails to appear ("view is not
in the window hierarchy"). The WebView doc shows this exact pattern.
**In this headless path, `onClose` is your completion signal** — the game's
`close_game` message and a manual exit both land there and are not distinguishable. The
`onMiniGameFinished` listener is emitted by the native-run session, so it fires for
the `MINI_GAME` UI flow — not for games rendered in your own `MiniGameWebView`. →
[Mini Games WebView](../../5.2_mini_games_webview.md),
[Event Listener](../../1.2.10_lucra_event_listener.md)
