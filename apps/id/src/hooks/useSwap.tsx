import { useMemo, useState } from 'react'
import {
  type Address,
  encodeFunctionData,
  erc20Abi,
  type Hex,
  parseUnits,
} from 'viem'
import { useSendCalls } from 'wagmi'
import { UniswapV2RouterABI } from './../abi/uniswap'

export type TokenConfig = {
  address: Address
  decimals: number
  symbol: string
  name: string
}

export type SwapProps = {
  amountIn: bigint
  amountOutMin: bigint
  toAddress: Address
  deadline: bigint
  accountAddress: Address
  from: TokenConfig
  shouldApprove?: boolean
}

export type ApproveSwapProps = {
  from: TokenConfig
}

export type TransactionCall = {
  to: Hex
  data?: Hex
  value?: bigint
}

export const UNISWAP_CONTRACTS_ROUTER =
  '0x6c10B45251F5D3e650bcfA9606c662E695Af97ea'

export function useSwap() {
  const [isPending, setIsPending] = useState<boolean>(false)
  const [isApproved, setIsApproved] = useState<boolean>(false)
  const [result, setResult] = useState<any | null>(null)

  const { sendCallsAsync } = useSendCalls()

  async function executeWithPasskey(calls: TransactionCall[]) {
    try {
      const result = await sendCallsAsync({
        calls,
        version: '1',
      })

      return {
        data: { ...result, usedSessionKey: false },
        error: null,
        success: true,
      }
    } catch (error) {
      console.log('execute-with-passkey-error: ', error)

      return {
        data: null,
        error,
        success: false,
      }
    }
  }

  async function onApprove(props: ApproveSwapProps) {
    const { from } = props

    // TOOD: Let the user know that the spending limit is just 50
    const maxAmount = parseUnits('50', from.decimals)

    setResult(null)
    setIsApproved(false)
    setIsPending(true)
    const calls: TransactionCall[] = []

    calls.push({
      data: encodeFunctionData({
        abi: erc20Abi,
        args: [UNISWAP_CONTRACTS_ROUTER, maxAmount],
        functionName: 'approve',
      }),
      to: from.address,
    })

    // const response = await execute({
    //     calls,
    //     requiredPermissions: {
    //         calls: [from.address.toLowerCase()],
    //     },
    // });

    const response = await executeWithPasskey(calls)

    if (response.success) {
      setIsApproved(true)
    }

    setIsPending(false)
    setResult(response)

    console.log('approve-hook-response:: ', response)
    return response
  }

  async function onSwap(props: SwapProps) {
    const {
      accountAddress,
      amountIn,
      amountOutMin,
      from,
      toAddress,
      deadline,
      shouldApprove,
    } = props

    setResult(null)
    setIsPending(true)
    const calls: TransactionCall[] = []

    // TOOD: Let the user know that the spending limit is just 50
    const maxAmount = parseUnits('50', from.decimals)

    if (shouldApprove) {
      calls.push({
        data: encodeFunctionData({
          abi: erc20Abi,
          args: [UNISWAP_CONTRACTS_ROUTER, maxAmount],
          functionName: 'approve',
        }),
        to: from.address,
      })
    }

    calls.push({
      data: encodeFunctionData({
        abi: UniswapV2RouterABI,
        args: [
          amountIn,
          amountOutMin,
          [from.address, toAddress],
          accountAddress,
          deadline,
        ],
        functionName: 'swapExactTokensForTokens',
      }),
      to: UNISWAP_CONTRACTS_ROUTER,
    })

    // const response = await execute({
    //     calls,
    //     requiredPermissions: {
    //         calls: [UNISWAP_CONTRACTS.router.toLowerCase()],
    //     },
    // });

    const response = await executeWithPasskey(calls)

    setIsPending(false)
    setResult(response)

    console.log('swap-hook-response:: ', response)
    return response
  }

  const isSuccess = useMemo(() => {
    return !!result?.success
  }, [result?.success])

  const error = useMemo(() => {
    return result?.error
  }, [result?.error])

  const errorMessage = useMemo(() => {
    return (
      result?.error?.shortMessage ??
      result?.error?.cause?.shortMessage ??
      result?.error?.message
    )
  }, [result?.error])

  const data = useMemo(() => {
    return result?.data
  }, [result?.data])

  function reset() {
    setResult(null)
  }

  return {
    data,
    error,
    errorMessage,
    isApproved,
    isPending,
    isSuccess,
    onApprove,
    onSwap,
    reset,
  }
}
