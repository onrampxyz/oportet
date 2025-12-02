import { Spinner } from '@porto/apps/components'
import { useMemo } from 'react'
import { Hooks } from 'rise-wallet/wagmi'
import { useAccount } from 'wagmi'
import { SessionFormatter } from '~/utils'
import LucideCopy from '~icons/lucide/copy'
import LucideInfo from '~icons/lucide/info'
import LucideTrash from '~icons/lucide/trash-2'

const SECURITY_TIPS = [
  `Regularly review your active sessions and revoke any you don't recognize`,
  'Set appropriate spending limits for each session to minimize risk',
  'Use shorter expiration times for sessions with higher spending permissions',
  'Only grant contract access to verified and trusted dApps',
  'Revoke sessions immediately if you suspect any suspicious activity',
]

export function Sessions() {
  const { address } = useAccount()

  const permissions = Hooks.usePermissions()

  const revokePermission = Hooks.useRevokePermissions()

  const sessions = useMemo(() => {
    if (permissions.isSuccess) {
      return permissions.data
    }
    return []
  }, [permissions])

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray12 text-lg">Active Sessions</h2>
          <p className="mt-1 text-gray10 text-sm">
            Manage session keys and permissions for connected dApps
          </p>
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {sessions.map((permission) => (
          <div
            className="rounded-lg border border-gray5 bg-white p-3 md:p-6 dark:bg-gray1"
            key={permission.id}
          >
            {/* Session Header */}
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold text-gray12">
                Session Key {SessionFormatter.truncateAddress(permission.id)}
              </h3>
              <button
                className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={() => {
                  revokePermission.mutate({
                    address: address,
                    chainId: permission.chainId as never,
                    id: permission.id,
                  })
                }}
                title="Revoke session"
                type="button"
              >
                <LucideTrash className="size-5" />
              </button>
            </div>

            {/* Session Details Grid */}
            <div className="mb-4 grid grid-cols-4 gap-4 rounded-lg border border-gray4 bg-gray1 p-4 dark:bg-gray2">
              <div className="max-sm:col-span-4">
                <p className="mb-1 text-gray10 text-xs">Public Key</p>
                <div className="flex items-center gap-1">
                  <p className="font-medium font-mono text-gray12 text-sm">
                    {SessionFormatter.truncateAddress(permission.key.publicKey)}
                  </p>
                  <button
                    className="text-gray10 transition-colors hover:text-gray12"
                    onClick={() => {
                      navigator.clipboard.writeText(permission.key.publicKey)
                    }}
                    type="button"
                  >
                    <LucideCopy className="size-3" />
                  </button>
                </div>
              </div>
              <div className="max-sm:col-span-4">
                <p className="mb-1 text-gray10 text-xs">Chain ID:</p>
                <p className="font-medium text-gray12 text-sm">
                  {permission.chainId}
                </p>
              </div>
              <div className="max-sm:col-span-4">
                <p className="mb-1 text-gray10 text-xs">Expires In:</p>
                <p className="font-medium text-gray12 text-sm">
                  {SessionFormatter.formatExpiryTime(permission.expiry)}
                </p>
              </div>
              <div className="max-sm:col-span-4">
                <p className="mb-1 text-gray10 text-xs">Type:</p>
                <p className="font-medium text-gray12 text-sm">
                  {permission.key.type}
                </p>
              </div>
              {permission.permissions.spend && (
                <div>
                  <p className="mb-1 text-gray10 text-xs">Spend Limit:</p>
                  <p className="font-medium text-gray12 text-sm">
                    {SessionFormatter.formatSpendLimit([
                      ...permission.permissions.spend,
                    ])}
                  </p>
                </div>
              )}
            </div>

            {/* Allowed Contract Calls */}
            {permission.permissions.calls.length > 0 && (
              <div>
                <p className="mb-3 font-medium text-gray12 text-sm">
                  Allowed Contract Calls
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {permission.permissions.calls.map((call, idx) => (
                    <div
                      className="flex flex-wrap items-center justify-between rounded-lg border border-gray4 bg-gray1 px-3 py-2 max-sm:col-span-2 dark:bg-gray2"
                      key={`${permission.id}-call-${idx}`}
                    >
                      <div className="flex flex-col gap-1">
                        {call.to && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray10 text-xs">To:</span>
                            <span className="font-mono text-gray12 text-xs">
                              {SessionFormatter.truncateAddress(call.to)}
                            </span>
                            <button
                              className="text-gray10 transition-colors hover:text-gray12"
                              onClick={() => {
                                navigator.clipboard.writeText(call.to!)
                              }}
                              type="button"
                            >
                              <LucideCopy className="size-3" />
                            </button>
                          </div>
                        )}
                        {call.signature && (
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-gray10 text-xs">
                              Signature:
                            </span>
                            <span className="font-mono text-gray11 text-xs">
                              {call.signature}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Loading State */}
      {permissions?.isPending && (
        <div className="flex items-center justify-center pt-6">
          <Spinner className="size-6!" />
        </div>
      )}

      {!permissions?.isPending && sessions.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray5 bg-white p-12 dark:bg-gray1">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-gray3">
            <LucideInfo className="size-8 text-gray10" />
          </div>
          <h3 className="mb-2 font-semibold text-gray12 text-lg">
            No active sessions
          </h3>
          <p className="max-w-md text-center text-gray10 text-sm">
            You don't have any active sessions. Sessions are created when you
            connect your wallet to dApps and grant them permissions.
          </p>
        </div>
      )}

      {/* Security Best Practices */}
      <div className="rounded-lg bg-violet-50 p-6 dark:border-violet-800 dark:bg-violet-900/5">
        <div className="mb-3 flex items-center gap-2">
          <LucideInfo className="size-5" />
          <h3 className="font-semibold">Security Best Practices</h3>
        </div>
        <ul className="space-y-3">
          {SECURITY_TIPS.map((tip) => (
            <li className="flex items-center gap-2 text-sm" key={tip}>
              <span className="text-gray10">•</span>
              <span className="pb-0.5">{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
