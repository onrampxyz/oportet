import { Button } from '@porto/apps/components'
import type { View } from '../AddFunds'

export type DepositProps = {
  setView: (view: View) => {}
}

export function DepositSelection(props: DepositProps) {
  const { setView } = props

  return (
    <div className="space-y-2">
      <Button
        className="flex w-full items-center justify-between rounded-lg border border-gray4 p-4 transition-colors hover:bg-gray3"
        onClick={() => { setView("selection-network") }}
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
  )
}
