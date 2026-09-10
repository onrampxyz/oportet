---
"oportet": patch
---

Removed pointers to Ithaca's porto services from the SDK. The porto.sh and porto.workers.dev hosts are no longer trusted hosts. Dialog warnings no longer link to porto's docs and repo. Headless WebAuthn P-256 signatures use `onramp.xyz` as origin and RP ID instead of `ithaca.xyz`. The CLI's `--dialog` flag has no `id.porto.sh` default and is required.
