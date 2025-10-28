import LucideCopy from '~icons/lucide/copy'
import LucideInfo from '~icons/lucide/info'
import LucideTrash from '~icons/lucide/trash-2'

type Contract = {
  address: string
  permissions: string[]
}

type SessionDetails = {
  key: string
  expiresIn: string
  type: string
  spendLimit: string
  allowedContracts: Contract[]
}

type Session = {
  id: string
  session: SessionDetails
}

const DUMMY_SESSIONS: Session[] = [
  {
    id: '1',
    session: {
      allowedContracts: [
        {
          address: '0x1f0B...F984',
          permissions: ['read', 'write'],
        },
        {
          address: '0x1f0B...F984',
          permissions: ['read'],
        },
        {
          address: '0x1f0B...F984',
          permissions: ['read', 'write'],
        },
        {
          address: '0x1f0B...F984',
          permissions: ['read'],
        },
        {
          address: '0x1f0B...F984',
          permissions: ['read', 'write'],
        },
        {
          address: '0x1f0B...F984',
          permissions: ['read'],
        },
      ],
      expiresIn: '50 minutes',
      key: '0x8f2c...8f2a',
      spendLimit: '50 Tokens per minute',
      type: 'p256',
    },
  },
  {
    id: '2',
    session: {
      allowedContracts: [
        {
          address: '0x1f0B...F984',
          permissions: ['read', 'write'],
        },
        {
          address: '0x1f0B...F984',
          permissions: ['read'],
        },
        {
          address: '0x1f0B...F984',
          permissions: ['read', 'write'],
        },
        {
          address: '0x1f0B...F984',
          permissions: ['read'],
        },
      ],
      expiresIn: '50 minutes',
      key: '0x8f2c...8f2a',
      spendLimit: '50 Tokens per minute',
      type: 'p256',
    },
  },
  {
    id: '3',
    session: {
      allowedContracts: [
        {
          address: '0x1f0B...F984',
          permissions: ['read', 'write'],
        },
        {
          address: '0x1f0B...F984',
          permissions: ['read'],
        },
        {
          address: '0x1f0B...F984',
          permissions: ['read', 'write'],
        },
        {
          address: '0x1f0B...F984',
          permissions: ['read'],
        },
      ],
      expiresIn: '50 minutes',
      key: '0x8f2c...8f2a',
      spendLimit: '50 Tokens per minute',
      type: 'p256',
    },
  },
]

const SECURITY_TIPS = [
  `Regularly review your active sessions and revoke any you don't recognize`,
  'Set appropriate spending limits for each session to minimize risk',
  'Use shorter expiration times for sessions with higher spending permissions',
  'Only grant contract access to verified and trusted dApps',
  'Revoke sessions immediately if you suspect any suspicious activity',
]

export function Sessions() {
  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-lg text-gray12">Active Sessions</h2>
          <p className="mt-1 text-gray10 text-sm">
            Manage session keys and permissions for connected dApps
          </p>
        </div>
        <button
          className="rounded-lg bg-red-500 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-red-600"
          type="button"
        >
          Revoke All Sessions
        </button>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {DUMMY_SESSIONS.map((session) => (
          <div
            className="rounded-lg border border-gray5 bg-white p-6 dark:bg-gray1"
            key={session.id}
          >
            {/* Session Header */}
            <div className="mb-4 flex items-start justify-between">
              <h3 className="font-semibold text-gray12">
                Session Key {session.id}
              </h3>
              <button
                className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                title="Revoke session"
                type="button"
              >
                <LucideTrash className="size-5" />
              </button>
            </div>

            {/* Session Details Grid */}
            <div className="mb-4 grid grid-cols-4 gap-4 rounded-lg bg-gray2 p-4 dark:bg-gray3">
              <div>
                <p className="mb-1 text-gray10 text-xs">Session</p>
                <div className="flex items-center gap-1">
                  <p className="font-mono font-medium text-gray12 text-sm">
                    {session.session.key}
                  </p>
                  <button
                    className="text-gray10 transition-colors hover:text-gray12"
                    onClick={() => {
                      navigator.clipboard.writeText(session.session.key)
                    }}
                    type="button"
                  >
                    <LucideCopy className="size-3" />
                  </button>
                </div>
              </div>
              <div>
                <p className="mb-1 text-gray10 text-xs">Key:</p>
                <p className="font-medium text-gray12 text-sm">
                  {session.session.key}
                </p>
              </div>
              <div>
                <p className="mb-1 text-gray10 text-xs">Expires In:</p>
                <p className="font-medium text-gray12 text-sm">
                  {session.session.expiresIn}
                </p>
              </div>
              <div>
                <p className="mb-1 text-gray10 text-xs">Type:</p>
                <p className="font-medium text-gray12 text-sm">
                  {session.session.type}
                </p>
              </div>
              <div className="col-span-4">
                <p className="mb-1 text-gray10 text-xs">Spend Limit:</p>
                <p className="font-medium text-gray12 text-sm">
                  {session.session.spendLimit}
                </p>
              </div>
            </div>

            {/* Allowed Contracts */}
            <div>
              <p className="mb-3 font-medium text-gray12 text-sm">
                Allowed Contracts
              </p>
              <div className="grid grid-cols-2 gap-2">
                {session.session.allowedContracts.map((contract, idx) => (
                  <div
                    className="flex items-center justify-between rounded-lg border border-gray4 bg-gray1 px-3 py-2 dark:bg-gray2"
                    key={idx}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-gray12 text-xs">
                        {contract.address}
                      </span>
                      <button
                        className="text-gray10 transition-colors hover:text-gray12"
                        onClick={() => {
                          navigator.clipboard.writeText(contract.address)
                        }}
                        type="button"
                      >
                        <LucideCopy className="size-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Security Best Practices */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="mb-3 flex items-center gap-2">
          <LucideInfo className="size-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-blue-900 dark:text-blue-200">
            Security Best Practices
          </h3>
        </div>
        <ul className="space-y-2">
          {SECURITY_TIPS.map((tip, idx) => (
            <li
              className="flex items-start gap-2 text-blue-900 text-sm dark:text-blue-200"
              key={idx}
            >
              <span className="mt-1 text-blue-600 dark:text-blue-400">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Empty state (uncomment if needed when no sessions) */}
      {/* {DUMMY_SESSIONS.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray5 bg-white p-12 dark:bg-gray1">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-gray3">
            <LucideInfo className="size-8 text-gray10" />
          </div>
          <h3 className="mb-2 font-semibold text-gray12 text-lg">
            No active sessions
          </h3>
          <p className="max-w-md text-center text-gray10 text-sm">
            You don't have any active sessions. Sessions are created when you connect
            your wallet to dApps and grant them permissions.
          </p>
        </div>
      )} */}
    </div>
  )
}
