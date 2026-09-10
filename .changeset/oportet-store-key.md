---
"oportet": patch
---

The default `storageKey` is now `oportet.store` (was `risewallet.store`). While `oportet.store` is empty, the store reads `risewallet.store`, so accounts saved before the rename are kept. The WebAuthn verification cache key changed from `risewallet.webauthnVerified.*` to `oportet.webauthnVerified.*`, which means at most one extra passkey verification.
