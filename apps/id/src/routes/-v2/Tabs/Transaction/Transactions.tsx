import { cx } from 'cva'

type TransactionStatus = 'pending' | 'completed' | 'failed'

type Transaction = {
  id: string
  type: 'Bridge' | 'Received' | 'Send' | 'Swap' | 'Deposit' | 'Withdraw'
  description: string
  status: TransactionStatus
  timestamp: string
  amount: string
  token: string
  isPositive: boolean
  hash?: string
}

const DUMMY_TRANSACTIONS: Transaction[] = [
  {
    amount: '+500.00',
    description: 'Ethereum → RISE',
    hash: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    id: '1',
    isPositive: true,
    status: 'pending',
    timestamp: '2 hours ago',
    token: 'USDC',
    type: 'Bridge',
  },
  {
    amount: '+500.00',
    description: 'From 0x9e85d40...b',
    hash: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    id: '2',
    isPositive: true,
    status: 'completed',
    timestamp: '5 hours ago',
    token: 'USDC',
    type: 'Received',
  },
  {
    amount: '-10.00',
    description: 'To 0x9e85d70cb...',
    hash: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    id: '3',
    isPositive: false,
    status: 'completed',
    timestamp: '8 hours ago',
    token: 'RISE',
    type: 'Send',
  },
  {
    amount: '-10.00',
    description: 'To 0x9e85d70cb...',
    hash: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    id: '4',
    isPositive: false,
    status: 'completed',
    timestamp: '8 hours ago',
    token: 'RISE',
    type: 'Send',
  },
  {
    amount: '-10.00',
    description: 'To 0x9e85d70cb...',
    hash: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    id: '5',
    isPositive: false,
    status: 'failed',
    timestamp: '8 hours ago',
    token: 'RISE',
    type: 'Send',
  },
]

const StatusBadge = ({ status }: { status: TransactionStatus }) => {
  const statusStyles = {
    completed:
      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    pending:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  }

  return (
    <span
      className={cx(
        'rounded-full px-2.5 py-1 font-medium text-xs capitalize',
        statusStyles[status],
      )}
    >
      {status}
    </span>
  )
}

export function Transactions() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="font-semibold text-gray12 text-lg">
          Recent Transactions
        </h2>
      </div>

      {/* Transactions List */}
      <div className="space-y-2">
        {DUMMY_TRANSACTIONS.map((transaction) => (
          <div
            className="flex items-center justify-between rounded-lg border border-gray5 bg-white p-4 transition-colors hover:bg-gray2 dark:bg-gray1"
            key={transaction.id}
          >
            {/* Left section: Type and Description */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray12 text-sm">
                  {transaction.type}
                </h3>
              </div>
              <p className="mt-0.5 text-gray10 text-xs">
                {transaction.description}
              </p>
            </div>

            {/* Middle section: Status and Timestamp */}
            <div className="flex flex-col items-center gap-1 px-8">
              <StatusBadge status={transaction.status} />
              <p className="text-gray10 text-xs">{transaction.timestamp}</p>
            </div>

            {/* Right section: Amount and Link */}
            <div className="flex flex-col items-end gap-1">
              <p
                className={cx(
                  'font-semibold text-sm',
                  transaction.isPositive ? 'text-green-600' : 'text-red-600',
                )}
              >
                {transaction.amount} {transaction.token}
              </p>
              {transaction.hash && (
                <button
                  className="text-violet9 text-xs hover:underline"
                  onClick={() => {
                    // In a real app, this would open the transaction in a block explorer
                    console.log('View transaction:', transaction.hash)
                  }}
                  type="button"
                >
                  See Transaction
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty state (uncomment if needed when no transactions) */}
      {/* {DUMMY_TRANSACTIONS.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray5 bg-white p-12 dark:bg-gray1">
          <p className="text-gray10 text-sm">No transactions yet</p>
        </div>
      )} */}
    </div>
  )
}
