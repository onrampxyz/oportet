import { Button } from '@porto/ui'
import { useFundsContext } from '~/contexts'
import { Layout } from '~/routes/-components/Layout'
import TriangleAlertIcon from '~icons/lucide/triangle-alert'

export function DepositError(props: DepositError.Props) {
  const { onReject } = props
  const { setView } = useFundsContext()

  return (
    <Layout>
      <Layout.Header>
        <Layout.Header.Default
          icon={TriangleAlertIcon}
          title="Deposit failed"
          variant="destructive"
        />
      </Layout.Header>

      <Layout.Content className="px-1">
        <p className="text-th_base">Your deposit was cancelled or failed.</p>
        <p className="text-th_base-secondary">No funds have been deposited.</p>
      </Layout.Content>

      <Layout.Footer>
        <Layout.Footer.Actions>
          <Button
            className="flex-grow"
            onClick={() => onReject?.()}
            variant="secondary"
          >
            Close
          </Button>
          <Button
            className="flex-grow"
            onClick={() => setView('default')}
            variant="primary"
          >
            Try again
          </Button>
        </Layout.Footer.Actions>
      </Layout.Footer>
    </Layout>
  )
}

export declare namespace DepositError {
  export type Props = {
    onReject?: () => void
  }
}
