import { baseSepolia } from 'rise-wallet/core/Chains'
import { porto } from 'rise-wallet/wagmi'
import { createConfig, http } from 'wagmi'

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [porto()],
  multiInjectedProviderDiscovery: false,
  transports: {
    [baseSepolia.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
