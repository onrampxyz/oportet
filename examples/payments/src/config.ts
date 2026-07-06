import { porto } from 'oportet/wagmi'
import { createConfig, http } from 'wagmi'
import { sepolia } from 'wagmi/chains'

export const config = createConfig({
  chains: [sepolia],
  connectors: [porto()],
  multiInjectedProviderDiscovery: false,
  pollingInterval: 1_000,
  transports: {
    [sepolia.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
