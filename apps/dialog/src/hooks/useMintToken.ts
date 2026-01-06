import type { Address } from 'ox'
import { Value } from 'ox'
import { useState } from 'react'
import { encodeFunctionData, parseAbiItem } from 'viem'
import { porto } from '~/lib/Porto'
import { ErrorFormatter } from '~/utils'

export type UseMintTokenParams = {
  address: Address.Address
  tokenAddress?: Address.Address
  chainId?: number
}

export function useMintToken(params: UseMintTokenParams) {
  const { address, chainId, tokenAddress } = params

  const [isMinting, setIsMinting] = useState(false)

  const mintToken = async () => {
    if (!tokenAddress || !chainId) return
    setIsMinting(true)

    try {
      const { id } = await porto.provider.request({
        method: 'wallet_sendCalls',
        params: [
          {
            calls: [
              {
                data: encodeFunctionData({
                  abi: [
                    parseAbiItem('function mint(address to, uint256 amount)'),
                  ],
                  args: [address, Value.from('100', 18)],
                  functionName: 'mint',
                }),
                to: tokenAddress,
              },
            ],
            chainId: `0x${chainId.toString(16)}`,
          },
        ],
      })

      const status = await porto.provider.request({
        method: 'wallet_getCallsStatus',
        params: [id],
      })

      console.log('mint call:', status)

      return status
    } catch (e) {
      const error = e as Error
      const message = typeof error.cause === 'string' ? error.cause : error.message

      console.log('mint error message:: ', ErrorFormatter.extractMessage(message))
    } finally {
      setIsMinting(false)
    }
  }

  return { isMinting, mintToken }
}
