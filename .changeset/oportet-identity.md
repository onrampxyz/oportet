---
"oportet": minor
---

The wallet now announces itself as `com.oportet.identity`, named "Oportet". It used to reuse RISE Wallet's identity (`com.risechain.wallet`, "Rise Wallet"). The wagmi connector id changes to match, so code that looks the connector up by id needs the new value. The connector icon is no longer RISE's logo; it now uses the same icon as the EIP-6963 announcement.
