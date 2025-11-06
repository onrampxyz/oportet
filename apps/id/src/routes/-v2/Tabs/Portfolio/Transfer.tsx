import { Button, Spinner, Toast } from '@porto/apps/components'
import { Address } from 'ox'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { parseUnits } from 'viem'
import { useAccount } from 'wagmi'
import { useTransfer } from '~/hooks/useTransfer'
import type { Balance } from '~/types/wallet'

export type TransferProps = {
  balance?: Balance
  isOpen: boolean
  onClose: () => void
  refetch: () => void
}

export function Transfer(props: TransferProps) {
  const { balance, isOpen, onClose, refetch } = props

  const [toAddress, setToAddress] = useState('')
  const [amount, setAmount] = useState('')

  const [addressError, setAddressError] = useState('')
  const [amountError, setAmountError] = useState('')

  const { chainId } = useAccount()

  const { onTransfer, isPending: isTransferring, errorMessage } = useTransfer()

  // Reset form when balance changes or panel closes
  useEffect(() => {
    if (!isOpen) {
      setToAddress('')
      setAmount('')
      setAddressError('')
      setAmountError('')
    }
  }, [isOpen])

  if (!balance) return null

  const handleMaxAmount = () => {
    if (balance) {
      setAmount(balance.balanceFormatted.toString())
      setAmountError('')
    }
  }

  const handleClose = () => {
    // Reset form
    setToAddress('')
    setAmount('')
    setAddressError('')
    setAmountError('')
    onClose()
  }

  const handleTransfer = async () => {
    if (!Address.validate(toAddress)) {
      setAddressError('Please enter a valid Ethereum address')
      return
    }

    // Validate amount
    const amountNumber = Number.parseFloat(amount)
    if (!amount || amountNumber <= 0) {
      setAmountError('Please enter a valid amount')
      return
    }

    if (balance && amountNumber > balance.balanceFormatted) {
      setAmountError(
        `Insufficient balance. You only have ${balance.balanceFormatted} ${balance.symbol}!`,
      )
      return
    }

    // Clear errors if validation passes
    setAddressError('')
    setAmountError('')

    // TODO: expose token address instead of tokenId
    const tokenAddress = balance?.tokenId.split('-')[1]
    const parsedAmount = parseUnits(amount, balance.decimals)

    if (tokenAddress) {
      const response = await onTransfer({
        address: tokenAddress as `0x${string}`,
        chainId,
        parsedAmount,
        recipient: toAddress,
      })

      if (response.error) {
        toast.custom(
          (t) => (
            <Toast
              className={t}
              description={errorMessage}
              kind="error"
              title="Transaction failed"
            />
          ),
          { duration: 3_500 },
        )
      }

      if (response.success) {
        // Close modal after a successful transfer
        toast.custom(
          (t) => (
            <Toast
              className={t}
              description="You have transferred your tokens successfully."
              kind="success"
              title="Transaction Succesful!"
            />
          ),
          { duration: 3_500 },
        )
        refetch()
        handleClose()
      }
    }
  }

  return (
    <div
      className={`overflow-hidden rounded-lg rounded-t-none border border-gray5 border-t-0 transition-all duration-300 ease-in-out ${
        isOpen ? 'max-h-[600px] p-4 opacity-100' : 'max-h-0 p-0 opacity-0'
      }`}
    >
      <div className="space-y-3">
        {/* Balance Info */}
        <div className="rounded-lg border border-gray5 bg-gray2 px-3 py-2">
          <p className="text-gray10 text-xs">Available Balance</p>
          <p className="font-semibold text-gray12 text-sm">
            {balance.balanceFormatted} {balance.symbol}
          </p>
        </div>

        {/* Address Input */}
        <div className="space-y-2">
          <label className="font-medium text-gray12 text-sm" htmlFor="address">
            Recipient Address
          </label>
          <input
            className={`w-full rounded-lg border p-3 text-sm focus:outline-none ${
              addressError
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray5 focus:border-violet9'
            }`}
            id="address"
            onChange={(e) => {
              setToAddress(e.target.value)
              // Clear error when user starts typing
              if (addressError) setAddressError('')
            }}
            placeholder="0x..."
            type="text"
            value={toAddress}
          />
          {addressError && (
            <p className="text-red-500 text-xs">{addressError}</p>
          )}
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <label className="font-medium text-gray12 text-sm" htmlFor="amount">
            Amount
          </label>
          <div
            className={`flex gap-1 rounded-lg border px-3 py-2 ${
              amountError ? 'border-red-500' : 'border-gray5'
            }`}
          >
            <input
              className="flex-1 text-sm focus:border-violet9 focus:outline-none"
              id="amount"
              onChange={(e) => {
                setAmount(e.target.value)
                // Clear error when user starts typing
                if (amountError) setAmountError('')
              }}
              placeholder="0.0"
              type="number"
              value={amount}
            />
            <Button
              className="pt-1"
              onClick={handleMaxAmount}
              size="small"
              variant="outline"
            >
              Max
            </Button>
          </div>
          {amountError && <p className="text-red-500 text-xs">{amountError}</p>}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button
            className="pt-1"
            disabled={isTransferring}
            onClick={handleClose}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            className="min-w-[80px] pt-1"
            disabled={
              !toAddress || !amount || Number(amount) <= 0 || isTransferring
            }
            onClick={handleTransfer}
            variant="primary"
          >
            {isTransferring ? <Spinner className="size-5!" /> : 'Send'}
          </Button>
        </div>
      </div>
    </div>
  )
}
