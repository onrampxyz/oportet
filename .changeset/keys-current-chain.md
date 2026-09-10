---
"oportet": patch
---

`wallet_getAdmins` now reads keys only on the chain it reports admins for, and `wallet_getPermissions` reads keys on the current chain when `chainIds` is omitted. Both used to call the relay's `wallet_getKeys` without chain IDs, which makes the relay read every chain it serves. Pass `chainIds` to `wallet_getPermissions` to get permissions on other chains.
