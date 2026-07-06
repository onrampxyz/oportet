import { Chains } from 'oportet'

export function getChains(env: string) {
  if (env === 'anvil')
    return [Chains.anvil, Chains.anvil2, Chains.anvil3] as const
  if (env === 'prod' || env === 'stg')
    return [Chains.riseTestnet, Chains.sepolia] as const
  throw new Error(`env ${env} not supported`)
}

export type ChainId = ReturnType<typeof getChains>[number]['id']
