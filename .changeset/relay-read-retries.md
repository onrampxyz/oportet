---
"oportet": patch
---

Read-only relay actions retry again. Making `relayProxy` build its relay transport with `retryCount: 0` stopped the inner transport from retrying, and that made every relay action marked `retryCount: 0` single-shot, reads included, so one slow response failed the call. `getCapabilities`, `prepareCalls`, `prepareUpgradeAccount`, `verifySignature` and the onramp status reads now go through the proxy's retries (4 attempts, as before). Actions that submit or send something stay single-shot: `sendPreparedCalls`, `upgradeAccount`, `addFaucetFunds`, and the email and phone set, resend and verify actions.
