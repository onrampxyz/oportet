import { Env } from '@porto/apps'
import { useMemo } from 'react'
import { rise, riseTestnet } from 'viem/chains'

export function useRiseChain() {
  const isProd = Env.get() === 'prod'

  // TODO: Fix any type - generate supported chains as soon as relayer is updated
  const riseChainId = useMemo(
    () => (isProd ? rise.id : riseTestnet.id),
    [isProd],
  ) as any

  const riseChain = useMemo(() => (isProd ? rise : riseTestnet), [isProd])

  return {
    isProd,
    riseChain,
    riseChainId,
  }
}
