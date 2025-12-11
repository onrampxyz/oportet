import { Button } from '@porto/ui'
import { useFundsContext } from '~/routes/contexts'
import { Layout } from '../Layout'

export function DepositSelection() {
  const { setView } = useFundsContext()

  return (
    <Layout>
      <Layout.Header>
        <Layout.Header.Default
          subContent="Deposit to your RISE Wallet via Global Deposit and Onramp"
          title="Global Deposit"
          variant="default"
        />
      </Layout.Header>
      <Layout.Content>
        <div className="space-y-2 pt-3">
          <Button
            className="w-full"
            onClick={() => {
              setView('selection-network')
            }}
            type="button"
            variant="primary"
          >
            Global Deposit
          </Button>
          <Button className="w-full" type="button" variant="primary">
            On Ramp
          </Button>
        </div>
      </Layout.Content>
    </Layout>
  )
}
