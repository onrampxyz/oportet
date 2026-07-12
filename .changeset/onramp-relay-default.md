---
"oportet": patch
---

Default the relay to Onramp's self-hosted relay (`relay.onramp.xyz`) and add `setRelayAuthToken()` so a consumer can attach a relay bearer (e.g. a gas-sponsorship JWT) per request without overriding the relay URL/transport. Unset (default) sends no auth header, matching prior open-relay behaviour.
