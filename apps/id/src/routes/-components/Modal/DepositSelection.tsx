import { Button } from '@porto/apps/components'
import { useModal } from '~/contexts/ModalContext'
import NetworkSelection from './NetworkSelection'

export function DepositSelection() {
  const { openModal } = useModal()

  return <div className="space-y-2">
    <Button
      className="flex w-full items-center justify-between rounded-lg border border-gray4 p-4 transition-colors hover:bg-gray3"
      onClick={() => {
        openModal({
          content: <NetworkSelection />,
          description: 'Deposit token from this chain',
          title: 'Choose a Network',
        })
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
}
