import { sepolia } from 'oportet/core/Chains'
import { porto } from 'oportet/wagmi'
import { createConfig, http } from 'wagmi'

export const config = createConfig({
  chains: [sepolia],
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
    [sepolia.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
