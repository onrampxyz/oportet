import { Spinner, Toast } from '@porto/apps/components'
import { riseTestnet } from 'porto/core/Chains'
import { Hooks } from 'porto/wagmi'
import { useMemo } from 'react'
import { toast } from 'sonner'
import { useAccount } from 'wagmi'
import { TruncatedAddress } from '~/components/TruncatedAddress'
import LucideCheck from '~icons/lucide/check'
import LucideCopy from '~icons/lucide/copy'
import LucideShield from '~icons/lucide/shield-alert'
import LucideTrash from '~icons/lucide/trash-2'
import { Connectors } from './Connectors'

// component > internal > core > actions > rpc_method
export function Recovery() {
  const account = useAccount()

  const admins = Hooks.useAdmins({
    query: {
      enabled: account.status === 'connected',
      select: (data) => ({
        ...data,
        keys: data.keys.filter((key) => key.type === 'address'),
      }),
    },
  })

  const recoverWallets = useMemo(() => {
    if (admins.data?.keys.length) {
      console.log('admins.data?.keys:: ', admins.data?.keys)
      return admins.data?.keys
    }
    return []
  }, [admins.data])

  const revokeAdmin = Hooks.useRevokeAdmin({
    mutation: {
      onError: (error) => {
        if (error.name === 'UserRejectedRequestError') return
        toast.custom((t) => (
          <Toast
            className={t}
            description={error.message}
            kind="error"
            title="Recovery Revoke Failed"
          />
        ))
      },
      onSuccess: () => {
        toast.custom((t) => (
          <Toast
            className={t}
            description="You have revoked a recovery admin"
            kind="success"
            title="Recovery Revoked"
          />
        ))
        admins.refetch()
      },
    },
  })

  const handleCopyAddress = (text: string) => {

    try {
      navigator.clipboard.writeText(text)
      toast.custom((t) => (
        <Toast
          className={t}
          description="Address copied to clipboard!"
          kind="success"
          title="Copied!"
        />
      ))
    } catch (error) {
      toast.custom((t) => (
        <Toast
          className={t}
          description="Failed to copy address"
          kind="error"
          title="Copy Failed"
        />
      ))
    }
  }

  return (
    <div className="space-y-6">
      {/* Warning Banner */}
      <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/20">
        <LucideShield className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <p className="text-amber-900 text-sm dark:text-amber-200">
          Never share your recovery phrase with anyone. Anyone with access to it
          can control your wallet and steal your funds.
        </p>
      </div>

      {/* Recovery Wallets Section */}
      <div className="space-y-4">
        {/* Header with Actions */}
        <div className="flex items-center justify-between px-2">
          <div>
            <div className="flex items-center gap-2">
              <LucideShield className="size-5 text-gray10" />
              <h2 className="font-semibold text-gray12 text-lg">
                Recovery Wallets
              </h2>
            </div>
            <p className="mt-1 text-gray10 text-sm">
              Manage backup wallets that can be used to recover your account
            </p>
          </div>
          {!admins?.isPending && <Connectors />}
        </div>

        {/* Loading State */}
        {admins?.isPending && (
          <div className="flex items-center justify-center pt-6">
            <Spinner className="size-6!" />
          </div>
        )}

        {/* Recovery Wallets List */}
        <div className="space-y-2">
          {recoverWallets.map((wallet) => (
            <div
              className="flex items-center justify-between rounded-lg border border-gray5 bg-white p-4 transition-colors hover:bg-gray2 dark:bg-gray1"
              key={wallet.id}
            >
              {/* Wallet Info */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-full bg-green3 p-2">
                  <LucideCheck className="size-4 text-green-600" />
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <TruncatedAddress
                    address={wallet.id ?? wallet.publicKey}
                    className="justify-start text-left text-sm sm:text-md"
                    end={10}
                    start={10}
                  />

                  <button
                    className="text-gray10 transition-colors hover:text-gray12"
                    onClick={() => {
                      handleCopyAddress(wallet.id ?? wallet.publicKey)
                    }}
                    title="Copy address"
                    type="button"
                  >
                    <LucideCopy className="size-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="flex items-center gap-1 rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => {
                    if (!wallet.id || !wallet.publicKey) return
                    const chainId = riseTestnet.id
                    revokeAdmin.mutate({
                      address: account.address,
                      chainId,
                      id: wallet.id,
                    })
                  }}
                  title="Remove wallet"
                  type="button"
                >
                  <LucideTrash className="size-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state (uncomment if needed when no wallets) */}
        {!admins?.isPending && recoverWallets.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-gray5 bg-white p-12 dark:bg-gray1">
            <LucideShield className="mb-4 size-12 text-gray8" />
            <h3 className="mb-2 font-semibold text-gray12 text-lg">
              No recovery wallets added
            </h3>
            <p className="mb-6 max-w-md text-center text-gray10 text-sm">
              Add backup wallets to ensure you can always recover your account
              if you lose access to your primary device.
            </p>
            <Connectors label="Add your first Recovery Wallet" />
          </div>
        )}
      </div>
    </div>
  )
}
