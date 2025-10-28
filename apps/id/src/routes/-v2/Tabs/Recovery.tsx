import { cx } from 'cva'
import { AddressFormatter } from '~/utils'
import LucideShield from '~icons/lucide/shield-alert'
import LucideTrash from '~icons/lucide/trash-2'
import LucideCopy from '~icons/lucide/copy'
import LucideCheck from '~icons/lucide/check'

type RecoveryWallet = {
  id: string
  name: string
  address: string
  verified: boolean
  addedDate: string
  avatar?: string
}

const DUMMY_RECOVERY_WALLETS: RecoveryWallet[] = [
  {
    id: '1',
    name: 'Metamask',
    address: '0x123456789...12345678',
    verified: true,
    addedDate: '1/25/2024',
  },
  {
    id: '2',
    name: 'Phantom',
    address: '0xabcdeff12...abcdeff12',
    verified: true,
    addedDate: '2/20/2024',
  },
  {
    id: '3',
    name: 'Rabby',
    address: '0x987654321...98765432',
    verified: false,
    addedDate: '3/10/2024',
  },
  {
    id: '4',
    name: 'Rabby',
    address: '0x987654321...98765432',
    verified: false,
    addedDate: '3/10/2024',
  },
  {
    id: '5',
    name: 'Rabby',
    address: '0x987654321...98765432',
    verified: false,
    addedDate: '3/10/2024',
  },
]

export function Recovery() {
  return (
    <div className="space-y-6">
      {/* Warning Banner */}
      <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/20">
        <LucideShield className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <p className="text-amber-900 text-sm dark:text-amber-200">
          Never share your recovery phrase with anyone. Anyone with access to it can
          control your wallet and steal your funds.
        </p>
      </div>

      {/* Recovery Wallets Section */}
      <div className="space-y-4">
        {/* Header with Actions */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <LucideShield className="size-5 text-gray10" />
              <h2 className="font-semibold text-lg text-gray12">Recovery Wallets</h2>
            </div>
            <p className="mt-1 text-gray10 text-sm">
              Manage backup wallets that can be used to recover your account
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="rounded-lg bg-red-500 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-red-600"
              type="button"
            >
              Remove All
            </button>
            <button
              className="rounded-lg bg-violet9 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-violet-700"
              type="button"
            >
              + Add Recovery Wallet
            </button>
          </div>
        </div>

        {/* Recovery Wallets List */}
        <div className="space-y-2">
          {DUMMY_RECOVERY_WALLETS.map((wallet, index) => (
            <div
              key={wallet.id}
              className="flex items-center justify-between rounded-lg border border-gray5 bg-white p-4 transition-colors hover:bg-gray2 dark:bg-gray1"
            >
              {/* Left section: Avatar and Wallet Info */}
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="flex size-12 items-center justify-center rounded-full bg-violet9 text-white">
                  <span className="font-semibold text-lg">
                    {wallet.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Wallet Info */}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray12 text-sm">
                      {wallet.name}
                    </h3>
                    {wallet.verified && (
                      <LucideCheck className="size-4 text-green-600" />
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="font-mono text-gray10 text-xs">{wallet.address}</p>
                    <button
                      className="text-gray10 transition-colors hover:text-gray12"
                      onClick={() => {
                        navigator.clipboard.writeText(wallet.address)
                      }}
                      title="Copy address"
                      type="button"
                    >
                      <LucideCopy className="size-3.5" />
                    </button>
                  </div>
                  <p className="mt-0.5 text-gray10 text-xs">
                    Added on {wallet.addedDate}
                  </p>
                </div>
              </div>

              {/* Right section: Actions */}
              <div className="flex items-center gap-2">
                <button
                  className="flex items-center gap-1 rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
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
        {/* {DUMMY_RECOVERY_WALLETS.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-gray5 bg-white p-12 dark:bg-gray1">
            <LucideShield className="size-12 text-gray8 mb-4" />
            <h3 className="font-semibold text-gray12 text-lg mb-2">
              No recovery wallets added
            </h3>
            <p className="text-gray10 text-sm text-center max-w-md mb-6">
              Add backup wallets to ensure you can always recover your account if you
              lose access to your primary device.
            </p>
            <button
              className="rounded-lg bg-violet9 px-6 py-2.5 font-medium text-sm text-white transition-colors hover:bg-violet-700"
              type="button"
            >
              Add Your First Recovery Wallet
            </button>
          </div>
        )} */}
      </div>
    </div>
  )
}
