import { createTransport, type Transport } from 'viem'

export { fallback, http, type Transport, webSocket } from 'viem'

export const relayUrls = {
  anvil: { http: 'http://localhost:9119' },
  prod: { http: 'https://relay.onramp.xyz' },
  stg: { http: 'https://stg.relay.wallet.risechain.com' },
} as const

/**
 * App-supplied bearer provider for authenticated relays (e.g. user-tied gas
 * sponsorship quota). Set once at init via {@link setRelayAuthToken}; the default
 * relay transport attaches the returned token as `Authorization: Bearer <token>`
 * per request. Unset (default) sends no auth header — an open relay, like RISE's.
 * Lets a consumer add relay auth without overriding the relay URL/transport.
 */
type RelayAuthToken = () => string | undefined | Promise<string | undefined>

let relayAuthToken: RelayAuthToken | undefined

export function setRelayAuthToken(provider: RelayAuthToken | undefined): void {
  relayAuthToken = provider
}

export async function getRelayAuthToken(): Promise<string | undefined> {
  return (await relayAuthToken?.()) ?? undefined
}

export function relayProxy(
  transports: relayProxy.Value,
): relayProxy.ReturnType {
  return (config) => {
    const transport_public = transports.public(config)
    const transport_relay = transports.relay(config)

    return createTransport({
      key: relayProxy.type,
      name: 'Relay Proxy',
      async request({ method, params }, options) {
        if (isRelay(method))
          return transport_relay.request({ method, params }, options) as never
        return transport_public.request({ method, params }, options) as never
      },
      type: relayProxy.type,
    })
  }
}

export namespace relayProxy {
  export const type = 'relayProxy'

  export type Value = { public: Transport; relay: Transport }

  export type ReturnType = Transport<typeof type>
}

/** @internal */
function isRelay(method: string) {
  if (method.startsWith('wallet_')) return true
  if (method.startsWith('account_')) return true
  if (method === 'health') return true
  return false
}
