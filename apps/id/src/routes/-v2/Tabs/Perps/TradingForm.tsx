import { Button } from '@porto/apps/components'
import { cx } from 'cva'
import LucideChevronDown from '~icons/lucide/chevron-down'

export type TradingFormProps = {
  orderType: 'long' | 'short'
  onOrderTypeChange: (type: 'long' | 'short') => void
}

export function TradingForm(props: TradingFormProps) {
  const { orderType, onOrderTypeChange } = props

  return (
    <div className="rounded-lg border border-gray5 bg-white p-4 dark:bg-gray1">
      {/* Long/Short Tabs */}
      <div className="mb-4 flex gap-2">
        <button
          className={cx(
            'flex-1 rounded py-2 font-medium text-sm transition-colors',
            orderType === 'long'
              ? 'bg-green-600 text-white'
              : 'bg-gray3 text-gray10 hover:bg-gray4',
          )}
          onClick={() => onOrderTypeChange('long')}
          type="button"
        >
          Long
        </button>
        <button
          className={cx(
            'flex-1 rounded py-2 font-medium text-sm transition-colors',
            orderType === 'short'
              ? 'bg-red-600 text-white'
              : 'bg-gray3 text-gray10 hover:bg-gray4',
          )}
          onClick={() => onOrderTypeChange('short')}
          type="button"
        >
          Short
        </button>
      </div>

      {/* Market/Limit Selector */}
      <div className="mb-4">
        <label className="mb-2 block text-gray10 text-xs" htmlFor="order-type">
          Order Type
        </label>
        <select
          className="w-full rounded border border-gray5 px-3 py-2 text-sm outline-none focus:border-violet9"
          id="order-type"
        >
          <option>Market</option>
          <option>Limit</option>
        </select>
      </div>

      {/* Leverage */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-gray10 text-xs" htmlFor="leverage">
            Leverage
          </label>
          <span className="font-medium text-sm">10x</span>
        </div>
        <input
          className="w-full"
          defaultValue="10"
          id="leverage"
          max="100"
          min="1"
          step="1"
          type="range"
        />
        <div className="mt-1 flex justify-between text-gray10 text-xs">
          <span>1x</span>
          <span>100x</span>
        </div>
      </div>

      {/* Size Input */}
      <div className="mb-4">
        <label className="mb-2 block text-gray10 text-xs" htmlFor="size">
          Size
        </label>
        <div className="relative">
          <input
            className="w-full rounded border border-gray5 px-3 py-2 pr-16 text-sm outline-none focus:border-violet9"
            id="size"
            placeholder="0.00"
            type="text"
          />
          <div className="-translate-y-1/2 absolute top-1/2 right-3 flex items-center gap-2">
            <span className="text-gray10 text-xs">BTC</span>
            <LucideChevronDown className="size-3 text-gray10" />
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="mb-4 space-y-2 rounded bg-gray2 p-3 text-sm dark:bg-gray3">
        <div className="flex justify-between">
          <span className="text-gray10">Available Balance:</span>
          <span className="font-medium">1,000.00 USD</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray10">Position Value:</span>
          <span>- -</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray10">Margin Required:</span>
          <span>- -</span>
        </div>
      </div>

      {/* Place Order Button */}
      <Button
        className={cx(
          'w-full',
          orderType === 'long'
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-red-600 hover:bg-red-700',
        )}
      >
        Place {orderType === 'long' ? 'Long' : 'Short'} Order
      </Button>
    </div>
  )
}
