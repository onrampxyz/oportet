import { Button, Toast } from '@porto/apps/components'
import type { Address } from 'ox'
import { Chains } from 'rise-wallet'
import { Hooks } from 'rise-wallet/wagmi'
import { toast } from 'sonner'
import { useAccount, useCapabilities, useSwitchChain } from 'wagmi'
import { GenericModal } from './GenericModal'

export function AddFunds() {
  const { isConnected, address } = useAccount()
  const capabilities = useCapabilities({
    query: { enabled: isConnected },
  })
  const { switchChainAsync } = useSwitchChain()

  const addFunds = Hooks.useAddFunds({
    mutation: {
      onError: (error) => {
        if (error.name === 'UserRejectedRequestError') return
        toast.custom((t) => (
          <Toast
            className={t}
            description={error.message}
            kind="error"
            title="Failed to add funds"
          />
        ))
      },
      onSuccess: () => {
        // TODO: make success message part of the dialog
        toast.custom((t) => (
          <Toast
            className={t}
            description="Funds added successfully"
            kind="success"
            title="Funds Added"
          />
        ))
      },
    },
  })

  const handleAddFunds = async () => {
    // if url has testnet search param
    const urlHasTestnet = window.location.search.includes('testnet')
    if (!urlHasTestnet) {
      addFunds.mutate({
        address,
      })
      return
    }
    await switchChainAsync({
      chainId: Chains.riseTestnet.id,
    }).catch()
    if (!capabilities.data) return
    const exp1 = capabilities.data?.[
      Chains.riseTestnet.id
    ]?.feeToken?.tokens?.find((t: any) => t.uid === 'exp1')
    if (!exp1) return
    addFunds.mutate({
      address,
      chainId: Chains.riseTestnet.id,
      token: exp1?.address as Address.Address,
      // @ts-expect-error TODO: fix type
      tokenAddress: exp1?.address as Address.Address,
    })
  }

  return (
    <div>
      <GenericModal
        description="Deposit funds via Global Deposit or OnRamp"
        title="Add Funds"
        triggerLabel="Add Funds"
      >
        <div className="space-y-2">
          <Button
            className="flex w-full items-center justify-between rounded-lg border border-gray4 p-4 transition-colors hover:bg-gray3"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              return handleAddFunds()
            }}
            type="button"
            variant="primary"
          >
            Global Deposit
          </Button>
          <Button
            className="flex w-full items-center justify-between rounded-lg border border-gray4 p-4 transition-colors hover:bg-gray3"
            type="button"
            variant="primary"
          >
            On Ramp
          </Button>
        </div>
      </GenericModal>
    </div>
  )
}
