import { Button, Spinner } from '@porto/apps/components'
import { useEffect, useMemo, useState } from 'react'
import { erc20Abi, formatUnits, parseUnits } from 'viem'
import { useAccount, useBalance, useReadContract } from 'wagmi'
import { UniswapV2RouterABI } from '~/abi/uniswap'
import { UNISWAP_CONTRACTS_ROUTER, useSwap } from '~/hooks/onchain/useSwap'
import { TOKENS } from '~/mock/tokens'
import type { Balance } from '~/types/wallet'
import type { TokenSymbol } from './WalletBalances'

export type SwapProps = {
  balance?: Balance
  isOpen: boolean
  onClose: () => void
  refetch: () => void
  fromToken: TokenSymbol
}

export function Swap(props: Readonly<SwapProps>) {
  const { balance, isOpen, onClose, fromToken } = props

  console.log('balance:: ', balance)

  const { address } = useAccount()
  const { onSwap, isPending: isSwapping, reset } = useSwap()

  const initialToToken = Object.keys(TOKENS).filter((token) => {
    return token !== fromToken
  })

  const [toToken, setToToken] = useState<TokenSymbol>(
    initialToToken[0] as TokenSymbol,
  )
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [error, setError] = useState('')

  const fromConfig = TOKENS[fromToken]
  const toConfig = TOKENS[toToken]

  // Get balances
  const { data: fromBalance, refetch: refetchFromBalance } = useBalance({
    address,
    query: { enabled: isOpen, refetchInterval: 10000 },
    token: fromConfig.address,
  })

  const { refetch: refetchToBalance } = useBalance({
    address,
    query: { refetchInterval: 10000 },
    token: toConfig.address,
  })

  // Check allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    abi: erc20Abi,
    address: fromConfig.address,
    args: [address ?? '0x', UNISWAP_CONTRACTS_ROUTER],
    functionName: 'allowance',
    query: {
      enabled: !!address && isOpen,
    },
  })

  const shouldApprove = useMemo(() => {
    if (!fromAmount || Number.parseFloat(fromAmount) <= 0) return false
    if (allowance === undefined || allowance === null) return true

    const requiredAmount = parseUnits(fromAmount, fromConfig.decimals)

    return allowance < requiredAmount
  }, [allowance, fromAmount, fromConfig])

  // Parse amount for quote
  const amountInBigInt = (() => {
    try {
      if (!fromAmount || fromAmount.trim() === '') return undefined
      const numAmount = Number.parseFloat(fromAmount)
      if (Number.isNaN(numAmount) || numAmount <= 0) return undefined
      return parseUnits(fromAmount, fromConfig.decimals)
    } catch (error) {
      console.log('❌ Amount parsing error:', error)
      return undefined
    }
  })()

  const contractArgs =
    amountInBigInt && fromToken !== toToken
      ? [amountInBigInt, [fromConfig.address, toConfig.address]]
      : undefined

  // Get quote
  const {
    data: quoteData,
    isLoading: quoteLoading,
    error: quoteError,
    isError: quoteIsError,
  } = useReadContract({
    abi: UniswapV2RouterABI,
    address: UNISWAP_CONTRACTS_ROUTER,
    args: [amountInBigInt ?? 0n, [fromConfig.address, toConfig.address]],
    functionName: 'getAmountsOut',
    query: {
      enabled:
        !!contractArgs &&
        !!amountInBigInt &&
        fromToken !== toToken &&
        !!address,
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  })

  const handleSwap = async () => {
    reset() // TODO debounce this

    const amountIn = parseUnits(fromAmount, fromConfig.decimals)
    const estimatedAmountOut = Number.parseFloat(toAmount)
    const minAmountOut = estimatedAmountOut * 0.8 // 20% slippage
    const amountOutMin = parseUnits(minAmountOut.toString(), toConfig.decimals)
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20) // 20 minutes

    // TODO: Add no quote available check
    if (fromBalance && amountIn > fromBalance.value) {
      setError('Insufficient balance')
      return
    }

    const response = await onSwap({
      accountAddress: address ?? '0x',
      amountIn,
      amountOutMin,
      deadline,
      from: fromConfig,
      shouldApprove,
      toAddress: toConfig.address,
    })

    if (response.success) {
      refetchToBalance()
      refetchFromBalance()
      refetchAllowance()
    }
  }

  const handleMaxClick = () => {
    if (fromBalance) {
      const maxAmount = formatUnits(fromBalance.value, fromBalance.decimals)
      setFromAmount(maxAmount)
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: listen only when fromToken has changed
  useEffect(() => {
    setToToken(initialToToken[0] as TokenSymbol)
  }, [fromToken])

  // TODO: Clean this
  // Update quote amount
  useEffect(() => {
    if (quoteData && Array.isArray(quoteData) && quoteData.length >= 2) {
      try {
        const outputAmount = formatUnits(quoteData[1], toConfig.decimals)
        const formattedAmount = Number.parseFloat(outputAmount).toFixed(6)
        setToAmount(formattedAmount)
        setError('')
      } catch (formatError) {
        console.log('❌ Quote Format Error:', formatError)
        setToAmount('')
        setError('Error formatting quote')
      }
    } else if (quoteIsError || quoteError) {
      setToAmount('')
      setError(
        quoteError?.message?.includes('INSUFFICIENT_OUTPUT_AMOUNT')
          ? 'Insufficient liquidity'
          : 'Quote failed - check liquidity',
      )
    } else if (!fromAmount || fromAmount.trim() === '') {
      setToAmount('')
      setError('')
    }
  }, [quoteData, quoteIsError, quoteError, fromAmount, toConfig.decimals])

  return (
    <div
      className={`overflow-hidden rounded-lg rounded-t-none border border-gray5 border-t-0 transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[600px] p-4 opacity-100' : 'max-h-0 p-0 opacity-0'
        }`}
    >
      <div className="space-y-3">
        {/* From Section */}
        <div className="">
          <div className="grid gap-6">
            <div className="space-y-2">
              <label
                className="font-medium text-gray12 text-sm"
                htmlFor="amount"
              >
                Amount
              </label>
              <div
                className={`flex flex-1 items-center gap-4 rounded-lg border px-3 py-2 ${error ? 'border-red-500' : 'border-gray5'
                  }`}
              >
                <input
                  className="flex-1 text-sm focus:border-violet9 focus:outline-none"
                  id="amount"
                  onChange={(e) => {
                    setFromAmount(e.target.value)
                    setError('')
                  }}
                  placeholder="0.0"
                  type="number"
                  value={fromAmount}
                />
                <p className="font-semibold text-sm">{fromConfig.symbol}</p>
                <Button onClick={handleMaxClick} size="small">
                  Max
                </Button>
              </div>
              {error && <p className="text-red-500 text-xs">{error}</p>}
            </div>

            <div className="space-y-2">
              <label className="font-medium text-gray12 text-sm" htmlFor="to">
                To
              </label>
              <div
                className={`flex gap-1 rounded-lg border px-3 py-2 ${error ? 'border-red-500' : 'border-gray5'
                  }`}
              >
                <input
                  className="flex-1 text-sm focus:border-violet9 focus:outline-none"
                  id="to"
                  placeholder="0.0"
                  readOnly
                  type="text"
                  value={quoteLoading ? 'please wait...' : toAmount}
                />
                <p className="font-semibold text-sm">{toConfig.symbol}</p>
              </div>
              {error && <p className="text-red-500 text-xs">{error}</p>}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button
            className="pt-1"
            disabled={isSwapping}
            onClick={onClose}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            className="min-w-[80px] pt-1"
            disabled={Number(fromAmount) <= 0 || isSwapping}
            onClick={handleSwap}
            variant="primary"
          >
            {isSwapping ? <Spinner className="size-5!" /> : 'Swap'}
          </Button>
        </div>
      </div>
    </div>
  )
}
