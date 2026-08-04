# Integrating the Lucra RN SDK — Start Here (LLM & Engineer Guide)

This is the connective map for integrating the Lucra React Native SDK. It holds **no API reference** of its
own — it explains how the pieces fit together and points you to the exact doc page for each detail.

**If you are an LLM/agent:** read this page top to bottom, then load the section relevant
to the user's stated goal and follow its pointers. Three companion
[Agent Skills](skills/README.md) go deeper — load them by name:

| Skill | Covers |
|---|---|
| [Setup & Troubleshooting](skills/lucra-react-native-start/SKILL.md) — `lucra-react-native-start` | Install, native setup, initialization, failure triage |
| [Expo Managed Workflow](skills/lucra-react-native-expo/SKILL.md) — `lucra-react-native-expo` | Config plugin, prebuild, fonts, Venmo entries |
| [Mini Games Integration](skills/lucra-react-native-minigames/SKILL.md) — `lucra-react-native-minigames` | SDK-rendered flows and the headless path |

## The one mental model

Everything goes through the single `LucraSDK` object from `@lucra-sports/lucra-react-native-sdk` — the SDK
owns auth, screens, and game logic; you don't rebuild them. You:

1. **Install** the package from GitHub Packages (a Personal Access Token is required — this is the
   most common first stumble), plus the native setup per platform: a private CocoaPods repo on iOS,
   Maven Central on Android.
2. **Initialize once**: `await LucraSDK.init({ apiKey, environment })`. Initialization is asynchronous —
   the resolved promise is your readiness signal. Don't present flows or call headless APIs before it resolves.
3. **Delegate the user session** to the SDK — present its `ONBOARDING` flow and observe the user via
   `LucraSDK.getUser()` / `LucraSDK.addListener('user', …)`; you don't build a login screen.
4. Then either **present a full SDK flow** (`LucraSDK.present({ name: LucraSDK.FLOW.… })`) for UI, or call a
   **headless function** (`LucraSDK.getMiniGames()`, `LucraSDK.startMiniGame(…)`, …) to pull data and render it yourself.

Everything else is deciding *which* flow or *which* headless call, and reacting to the events the SDK
publishes back.

## Route by intent

| Goal | Go to |
|---|---|
| Add the SDK / first run / it won't build or install | [Project Setup](1.0.0_project_setup.md) → [Setup & Troubleshooting](skills/lucra-react-native-start/SKILL.md) |
| Expo managed workflow (config plugin, prebuild, Expo Go) | [Expo Managed Workflow](skills/lucra-react-native-expo/SKILL.md) |
| Initialize the SDK / API keys / environment | [LucraSDK Initialization](1.2.0_initialize_client.md) |
| Know if a user is signed in / delegate auth | [Headless Functionality → User](1.2.9_headless_interactions.md) |
| Present any SDK screen | [Lucra Flows](1.2.7_lucraflows.md) |
| Mini Games (UI, headless, or your own WebView) | [Mini Games Integration](skills/lucra-react-native-minigames/SKILL.md) + [Mini Games](5.0.0_mini_games.md) |
| Tournaments | [Tournaments Flows](3.1_tournaments_flows.md) |
| React to game/user/tournament state | [Lucra Event Listener](1.2.10_lucra_event_listener.md) |
| Handle deep links | [Deeplinks](1.2.2_deeplinks.md) |
| Theme the SDK UI to your brand | [Theming and Appearance](1.2.1_theming.md) |

## How the parts connect (the things docs cover in isolation)

- **Install is registry-gated.** The npm package lives on GitHub Packages, so a PAT in `.npmrc` is
  required before anything else works (don't commit it). iOS pods come from Lucra's private CocoaPods
  repo; Android artifacts come from Maven Central with no auth. Expo Go is not supported — use a bare
  workflow or `expo prebuild`. → [Project Setup](1.0.0_project_setup.md)
- **Readiness is explicit.** `LucraSDK.init(…)` returns a promise; gate all SDK interaction on it
  resolving (the init doc's `isReady` pattern). → [Initialization](1.2.0_initialize_client.md)
- **Auth is delegated.** Present `LucraSDK.FLOW.ONBOARDING`; the SDK owns the login UI. Learn the result
  via `LucraSDK.getUser()` or the `'user'` listener; sign out with `LucraSDK.logout()`.
  (`LucraSDK.configureUser(…)` is a separate path for passing your app's known user properties — it queues
  until login completes.) → [Headless Functionality](1.2.9_headless_interactions.md)
- **Flows vs Headless.** `LucraSDK.present({ name: … })` shows a full Lucra screen; headless calls return
  data you render yourself. Mix them: headless powers *your* lists and launchers, flows power the
  *interactive* parts. → [Flows](1.2.7_lucraflows.md) / [Headless](1.2.9_headless_interactions.md)
- **State comes back as events**, not return values from the screen you presented — register listeners
  for user, contest, and mini game events. → [Event Listener](1.2.10_lucra_event_listener.md)

## Fastest path to a working integration

1. Set up the `.npmrc` PAT, install the package, and complete the per-platform native setup — get an
   empty app building on both platforms.
2. `await LucraSDK.init({ apiKey, environment: LucraSDK.ENVIRONMENT.SANDBOX })`, present
   `ONBOARDING`, and confirm `LucraSDK.getUser()` returns a user.
3. Only then add features. The in-repo example app is a legitimate starting point:
   [`example/`](https://github.com/Lucra-Sports/lucra-react-native-sdk/tree/main/example) (bare).

## When you're stuck

Go to [Setup & Troubleshooting](skills/lucra-react-native-start/SKILL.md) → Troubleshoot. It maps each
common failure (registry 401s, pod install failures, manifest merge errors, flows that no-op before init,
key/environment mismatches) to the thing to check and the doc page to reopen.
