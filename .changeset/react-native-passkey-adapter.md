---
"oportet": minor
---

Add the React Native passkey adapter (`createReactNativePasskeyAdapter`), hoisted from upstream PR #1000, wired as the relay fallback behind the React Native dialog mode. Dismissed passkey prompts (Android `UserCancelled`/`NotAllowedError`, iOS `UserCancelledException`) now surface as EIP-1193 code `4001` so the relay transport does not retry and reopen the sheet.
