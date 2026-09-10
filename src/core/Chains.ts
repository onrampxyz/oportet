import { type Chain, defineChain } from 'viem'
import { anvil as viem_anvil } from 'viem/chains'
import * as chains from './internal/_generated/chains.js'

export type { Chain } from 'viem/chains'
export * from './internal/_generated/chains.js'

export const all = [
  chains.riseTestnet,
  ...Object.values(chains).filter((c) => c.id !== chains.riseTestnet.id),
] as const satisfies [Chain, ...Chain[]]

export const anvil = viem_anvil

/** Additional Anvil environment, purposed for interop. */
export const anvil2 = /*#__PURE__*/ defineChain({
  ...anvil,
  id: 31_338,
})

/** Additional Anvil environment, purposed for interop. */
export const anvil3 = /*#__PURE__*/ defineChain({
  ...anvil,
  id: 31_339,
})

/** Robinhood Chain, an Arbitrum Orbit L2. viem does not define it yet. */
export const robinhood = /*#__PURE__*/ defineChain({
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://robinhoodchain.blockscout.com',
    },
  },
  contracts: {
    multicall3: { address: '0xcA11bde05977b3631167028862bE2a173976CA11' },
  },
  id: 4663,
  name: 'Robinhood Chain',
  nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
  rpcUrls: {
    default: { http: ['https://rpc.mainnet.chain.robinhood.com'] },
  },
})

export function isAnvil(chainId: number | undefined) {
  return chainId === anvil.id || chainId === anvil2.id || chainId === anvil3.id
}
