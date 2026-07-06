import AsyncStorage from '@react-native-async-storage/async-storage'
import { sepolia } from 'oportet/core/Chains'
import { Mode } from 'oportet/react-native'
import { porto as portoConnector } from 'oportet/wagmi'
import { Value } from 'ox'
import { Platform } from 'react-native'
import { createConfig, createStorage, http } from 'wagmi'

import { exp1Address, exp2Address } from './contracts.ts'

export const config = createConfig({
  chains: [sepolia],
  connectors: [
    portoConnector({
      ...Platform.select({
        default: { mode: Mode.reactNative() },
        web: { mode: Mode.dialog() },
      }),
    }),
  ],
  multiInjectedProviderDiscovery: false,
  storage: createStorage({ storage: AsyncStorage }),
  transports: {
    [sepolia.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}

export const chainId = sepolia.id

export const permissions = () =>
  ({
    expiry: Math.floor(Date.now() / 1_000) + 60 * 60, // 1 hour
    feeToken: {
      limit: '10',
      symbol: 'EXP',
    },
    permissions: {
      calls: [
        { to: exp1Address },
        { to: exp2Address },
        {
          signature: 'mint()',
          to: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
        },
      ],
      spend: [
        {
          limit: Value.fromEther('50000'),
          period: 'minute',
          token: exp1Address,
        },
      ],
    },
  }) as const
