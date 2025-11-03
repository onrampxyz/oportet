import type { BalanceChange } from '~/types/portfolio'

const DUMMY_BALANCE_CHANGE: BalanceChange = {
    protocols: '+$51.15',
    totalChange: '+$51.15',
    transactions: 12,
    wallet: '+$23.45',
}

export function Summary() {
    return <div className="rounded-lg border border-gray5 bg-white p-6 dark:bg-gray1">
        <h2 className="mb-2 font-semibold text-lg">24h Balance Change</h2>
        <p className="mb-4 text-gray10 text-sm">
            Summary of portfolio changes over the last 24 hours
        </p>

        <div className="grid grid-cols-4 gap-4">
            <div className="rounded-md border border-gray5 p-5 text-center">
                <p className="mb-1 text-gray10 text-xs">Total Change</p>
                <p className="text-2xl">{DUMMY_BALANCE_CHANGE.totalChange}</p>
            </div>
            <div className="rounded-md border border-gray5 p-5 text-center">
                <p className="mb-1 text-gray10 text-xs">Wallet</p>
                <p className="text-2xl text-green-600">
                    {DUMMY_BALANCE_CHANGE.wallet}
                </p>
            </div>
            <div className="rounded-md border border-gray5 p-5 text-center">
                <p className="mb-1 text-gray10 text-xs">Protocols</p>
                <p className="text-2xl text-green-600">
                    {DUMMY_BALANCE_CHANGE.protocols}
                </p>
            </div>
            <div className="rounded-md border border-gray5 p-5 text-center">
                <p className="mb-1 text-gray10 text-xs">Transactions</p>
                <p className="text-2xl">{DUMMY_BALANCE_CHANGE.transactions}</p>
            </div>
        </div>
    </div>
}
