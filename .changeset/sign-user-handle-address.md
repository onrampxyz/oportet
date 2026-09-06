---
"oportet": patch
---

Signing with a WebAuthn key now reads the account address from the first 20 bytes of the user handle, the same way discovery does. A passkey added next to the first one carries a user handle with random bytes after the address; before this, signing with it threw an invalid-address error.
