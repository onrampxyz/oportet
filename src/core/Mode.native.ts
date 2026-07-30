export { reactNative } from './internal/modes/reactNative.js'
// Re-exported for React Native too: `relay.js` has no `.native` variant and does
// not self-loop through this file, so `Mode.relay(...)` works unchanged there.
// Consumers were otherwise pinning a patch onto `dist/core/Mode.native.js` to
// add this single line.
export { relay } from './internal/modes/relay.js'
export * from './Mode.js'
