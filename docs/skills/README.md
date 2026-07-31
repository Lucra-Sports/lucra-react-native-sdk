# Agent Skills

Task-scoped guides for integrating the Lucra React Native SDK with an AI coding agent. Each one is a
self-contained skill: it states its prerequisites, walks the happy path, and points to the reference
doc for exact signatures rather than restating them.

Start with [SDK Integration Guide](../SKILLS.md) for the overall map, then load the skill that matches
what you're doing.

| Skill | Use it when |
|---|---|
| [Setup & Troubleshooting](lucra-react-native-start/SKILL.md) | Adding the SDK, first run, initialization, or a build/install failure |
| [Expo Managed Workflow](lucra-react-native-expo/SKILL.md) | The app is Expo-managed — config plugin, prebuild, fonts, Venmo entries |
| [Mini Games Integration](lucra-react-native-minigames/SKILL.md) | Adding Mini Games, via SDK-rendered flows or the headless path |

These pages carry no API reference of their own. Signatures, parameters, and payloads live in the
numbered docs they link to.
