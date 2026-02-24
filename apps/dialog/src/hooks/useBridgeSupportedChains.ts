import { Env } from '@porto/apps'
import { useMemo } from 'react'
import { mainnet, rise, riseTestnet, sepolia } from 'viem/chains'

export type Chain = {
  id: number
  name: string
  icon: string
  blockExplorer: string
}

/**
 * Hook to get supported chains based on environment
 * - prod: riseMainnet + mainnet
 * - staging: riseTestnet + sepolia
 */
export function useBridgeSupportedChains() {
  const isProd = Env.get() === 'prod'
  console.log('isProd:: ', isProd)

  const chains = useMemo<Chain[]>(() => {
    return isProd
      ? [
          //   {
          //     blockExplorer: rise.blockExplorers.default.url,
          //     icon: '/dialog/chains/rise.svg',
          //     id: rise.id,
          //     name: rise.name,
          //   },
          {
            blockExplorer: mainnet.blockExplorers.default.url,
            icon: '/dialog/chains/eth.svg',
            id: mainnet.id,
            name: mainnet.name,
          },
          // Add Arbitrum
          // Add Base
        ]
      : [
          //   {
          //     blockExplorer: riseTestnet.blockExplorers.default.url,
          //     icon: '/dialog/chains/rise.svg',
          //     id: riseTestnet.id,
          //     name: riseTestnet.name,
          //   },
          {
            blockExplorer: sepolia.blockExplorers.default.url,
            icon: '/dialog/chains/eth.svg',
            id: sepolia.id,
            name: sepolia.name,
          },
        ]
  }, [isProd])

  const riseChainId = useMemo(
    () => (isProd ? rise.id : riseTestnet.id),
    [isProd],
  )

  const riseChain = useMemo(() => (isProd ? rise : riseTestnet), [isProd])

  return {
    chains,
    isProd,
    riseChain,
    riseChainId,
  }
}
