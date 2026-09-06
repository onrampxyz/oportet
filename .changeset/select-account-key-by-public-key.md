---
'oportet': patch
---

`wallet_connect` with `selectAccount.key` now attaches the credential to the key whose `publicKey` matches, instead of assuming the account's first key is the one the caller selected. An account with two passkeys could only ever sign with the first one authorized, whatever credential the caller handed in; with the wrong key hash under the WebAuthn signature the relay rejected the intent. Without a selection the first key is still assumed to be the admin WebAuthn key.
