---
'oportet': patch
---

Export `Mode.relay` from the React Native entrypoint and stop wrapping passkey user-rejections.

Two fixes that consumers were previously carrying as pnpm patches:

- `Mode.native` now re-exports `relay` alongside `reactNative`. `relay.js` has no `.native` variant and does not self-loop through `Mode.native`, so `Mode.relay(...)` already worked on React Native; only the export was missing, and consumers were patching the single line into `dist/core/Mode.native.js`.
- `WebAuthnP256.createCredential` / `.sign` funnel every failure from a caller-supplied `createFn` / `getFn` into `CredentialCreationFailedError` / `CredentialRequestFailedError`, which drops the EIP-1193 `code`. A passkey the user dismissed therefore reached viem as a generic failure, `shouldRetry` returned true, and the passkey sheet reopened on every attempt. The four WebAuthn call sites now re-surface a rejection carrying code 4001 from the cause chain. The match is structural rather than `instanceof`, because the adapter that throws can come from a different copy of `ox` than the one that catches.

Also corrects the declared `ox` dependency range from `^0.9.6` to `^0.14.0`. The package is built and tested against the 0.14 line already, so the old range made consumers resolve a second, older `ox` copy at runtime.
