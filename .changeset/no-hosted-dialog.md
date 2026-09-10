---
"oportet": minor
---

`Porto.create()` now defaults to `Mode.relay()` in the browser too. The browser default used to be `Mode.dialog()` pointed at RISE's hosted dialog (wallet.risechain.com), which oportet does not run. `Mode.dialog()` no longer has a default `host` and throws at setup without one. `Dialog.hostUrls` keeps only `local`.
