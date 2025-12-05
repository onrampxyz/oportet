import { baseSepolia } from 'rise-wallet/core/Chains'
import { porto } from 'rise-wallet/wagmi'
import { createConfig, http } from 'wagmi'

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    porto({
      authUrl: {
        logout: '/api/siwe/logout',
        nonce: '/api/siwe/nonce',
        verify: '/api/siwe/verify',
      },
    }),
  ],
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
