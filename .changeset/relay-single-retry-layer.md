---
"oportet": patch
---

`Transport.relayProxy` now creates the relay transport with `retryCount: 0` and does the retrying itself, the way viem's `fallback` treats its transports. Both layers used to retry, so one failed relay request could go out 16 times. Requests sent with `retryCount: 0`, such as `wallet_sendPreparedCalls`, were still retried up to 3 times by the inner transport. A relay transport created with an explicit `retryCount` keeps it.
