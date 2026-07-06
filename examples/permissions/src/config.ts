import { porto } from 'oportet/wagmi'
import { parseEther } from 'viem'
import { createConfig, http } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { exp1Config } from './contracts'

export const config = createConfig({
  chains: [sepolia],
  connectors: [porto()],
  multiInjectedProviderDiscovery: false,
  pollingInterval: 1_000,
  transports: {
    [sepolia.id]: http(),
  },
})

export const permissions = () =>
  ({
    expiry: Math.floor(Date.now() / 1_000) + 60 * 60, // 1 hour
    feeToken: {
      limit: '1',
      symbol: 'EXP',
    },
    permissions: {
      calls: [{ to: exp1Config.address }],
      spend: [
        {
          limit: parseEther('10'),
          period: 'hour',
          token: exp1Config.address,
        },
      ],
    },
  }) as const

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
