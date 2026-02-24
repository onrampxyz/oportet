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
  const isProd = import.meta.env.VITE_VERCEL_ENV === 'production'

  console.log('isProd:: ', isProd)
  console.log('VITE_VERCEL_ENV:: ', import.meta.env.VITE_VERCEL_ENV)

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
            icon: '/dialog/chains/sepolia.svg',
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
            icon: '/dialog/chains/sepolia.svg',
            id: sepolia.id,
            name: sepolia.name,
          },
        ]
  }, [])

  const riseChainId = useMemo(() => (isProd ? rise.id : riseTestnet.id), [])

  return {
    chains,
    isProd,
    riseChainId,
  }
}
