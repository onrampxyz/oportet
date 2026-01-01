import { Porto } from 'rise-wallet'
import { createConfig, http } from 'wagmi'
import { sepolia } from 'wagmi/chains'

Porto.create()

export const config = createConfig({
  chains: [sepolia],
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
