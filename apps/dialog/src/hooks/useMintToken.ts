import type { Address, Hex } from 'ox'
import { Value } from 'ox'
import { encodeFunctionData, parseAbiItem } from 'viem'
import { porto } from '~/lib/Porto'

export type UseMintTokenParams = {
  address: Address.Address
  tokenAddress?: Address.Address
  chainId?: number
}

export function useMintToken(params: UseMintTokenParams) {
  const { address, chainId, tokenAddress } = params

  const mintToken = async () => {
    console.log('address To:: ', address)
    console.log('selectedTokenAddress:: ', tokenAddress)
    console.log('selectedChainId:: ', chainId)

    if (!tokenAddress || !chainId) return

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
          chainId: `0x${chainId.toString(16)}` as Hex.Hex,
        },
      ],
    })

    const status = await porto.provider.request({
      method: 'wallet_getCallsStatus',
      params: [id],
    })

    console.log('mint call:', status)

    return status
  }

  return { mintToken }
}
