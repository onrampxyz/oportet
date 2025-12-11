import { Button } from '@porto/ui'
import type { View } from '../AddFunds'
import { Layout } from '../Layout'

export type DepositProps = {
  setView: (view: View) => void
}

export function DepositSelection(props: DepositProps) {
  const { setView } = props

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
        <div className="space-y-2 pt-4">
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
          <Button className="w-full" type="button" variant="primary"  >
            On Ramp
          </Button>
        </div>
      </Layout.Content>
    </Layout>
  )
}
