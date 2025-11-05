import * as Ariakit from '@ariakit/react'
import { Button, Spinner } from '@porto/apps/components'
import { Address } from 'ox'
import { useState } from 'react'
import { parseUnits } from 'viem'
import { useTransfer } from '~/hooks/useTransfer'
import type { Balance } from '~/types/wallet'
import LucideX from '~icons/lucide/x'

export type TransferProps = {
  balance?: Balance
  isOpen: boolean
  onClose: () => void
}

export function Transfer(props: TransferProps) {
  const { balance, isOpen, onClose } = props

  console.log('balance:', balance)

  const [toAddress, setToAddress] = useState('')
  const [amount, setAmount] = useState('')

  const [addressError, setAddressError] = useState('')
  const [amountError, setAmountError] = useState('')

  const {
    onTransfer,
    isPending: isTransferring,
    data: result,
    errorMessage,
    isSuccess,
  } = useTransfer()

  if (!isOpen || !balance) return null

  const handleMaxAmount = () => {
    if (balance) {
      setAmount(balance.balanceFormatted.toString())
      setAmountError('')
    }
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

    // TODO: Implement send logic
    console.log('Sending:', { address: toAddress, amount, balance })

    // TODO: expose token address instead of tokenId
    const tokenAddress = balance?.tokenId.split('-')[1]
    const parsedAmount = parseUnits(amount, balance.decimals)

    if (tokenAddress) {
      const response = await onTransfer({
        address: tokenAddress as `0x${string}`,
        parsedAmount,
        recipient: toAddress,
      })

      console.log('response.error:: ', response.error)
      if (response.success) {
        // Close modal after a successful transfer
        onClose()
      }
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

  return (
    <Ariakit.Dialog
      // backdrop={<div className="dialog-backdrop" />}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClose={handleClose}
      open={isOpen}
    >
      <div className="space-y-3 rounded-lg border border-gray5 bg-white p-5 dark:bg-gray1">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Transfer Token</h2>

          <Button
            disabled={isTransferring}
            onClick={handleClose}
            size="small"
            variant="outline"
          >
            <LucideX className="size-5" />
          </Button>
        </div>

        {/* Balance Info */}
        {balance && (
          <div className="rounded-lg border border-gray5 bg-gray2 px-3 py-2">
            <p className="text-gray10 text-xs">Available Balance</p>
            <p className="font-semibold text-gray12 text-sm">
              {balance.balanceFormatted} {balance.symbol}
            </p>
          </div>
        )}

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
            {isTransferring ? <Spinner /> : 'Send'}
          </Button>
        </div>
      </div>
    </Ariakit.Dialog>
  )
}
