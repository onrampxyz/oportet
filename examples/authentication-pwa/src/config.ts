import { sepolia } from 'rise-wallet/core/Chains'
import { porto } from 'rise-wallet/wagmi'
import { createConfig, http } from 'wagmi'

export const config = createConfig({
  chains: [sepolia],
  connectors: [porto()],
  multiInjectedProviderDiscovery: false,
  transports: {
    [sepolia.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
