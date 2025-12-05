import { useMemo, useState } from 'react'
import { type Address, encodeFunctionData, erc20Abi, type Hex } from 'viem'
import { useSendCalls } from 'wagmi'

export type TransferProps = {
  address: Address
  recipient: Address
  parsedAmount: bigint
  chainId?: number
}

export type TransactionCall = {
  to: Hex
  data?: Hex
  value?: bigint
}

export function useTransfer() {
  const [isPending, setIsPending] = useState<boolean>(false)
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

  async function onTransfer(props: TransferProps) {
    const { address, recipient, parsedAmount } = props

    setResult(null)
    setIsPending(true)
    const calls: TransactionCall[] = []

    calls.push({
      data: encodeFunctionData({
        abi: erc20Abi,
        args: [recipient, parsedAmount],
        functionName: 'transfer',
      }),
      to: address, // tokenAddress
    })

    const response = await executeWithPasskey(calls)

    setIsPending(false)
    setResult(response)

    console.log('transfer-hook-response:: ', response)
    return response
  }

  // 0x8F8faa9eBB54DEda91a62B4FC33550B19B9d33bf - metamask
  // 0x0e18ace8b124aad65e81c439bfecad5abe9eafc4 - riselabs
  // 0xE1C19095790FCe54bC2747B68664D1184288Ebb7 - personal

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

  return {
    data,
    error,
    errorMessage,
    isPending,
    isSuccess,
    onTransfer,
  }
}
