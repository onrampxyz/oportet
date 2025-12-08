import { Button } from '@porto/ui'
import type * as Mipd from 'mipd'
import * as React from 'react'
import { Hooks } from 'rise-wallet/remote'
import * as Dialog from '~/lib/Dialog'
import { porto } from '~/lib/Porto'
import { ExternalWalletPopover } from '~/routes/-components/ExternalWalletPopover'
import { Layout } from '~/routes/-components/Layout'
import { Permissions } from '~/routes/-components/Permissions'
import LucideLogIn from '~icons/lucide/log-in'

export function SignIn(props: SignIn.Props) {
  const { onApprove, permissions, providers = [], status } = props

  const account = Hooks.useAccount(porto)
  const hostname = Dialog.useStore((state) => state.referrer?.url?.hostname)

  const [mode, setMode] = React.useState<'sign-in' | 'sign-up'>('sign-in')
  const signingIn = mode === 'sign-in' && status === 'responding'
  const signingUp = mode === 'sign-up' && status === 'responding'

  return (
    <Layout>
      <Layout.Header className="flex-grow">
        <Layout.Header.Default
          content={
            <>
              Authenticate with your RISE Wallet account to start using{' '}
              {hostname ? (
                <span className="font-medium">{hostname}</span>
              ) : (
                'this website'
              )}
              .
            </>
          }
          icon={LucideLogIn}
          title="Get started"
        />
      </Layout.Header>

      <Permissions title="Permissions requested" {...permissions} />

      <Layout.Footer>
        <Layout.Footer.Actions>
          <div className="flex min-w-0 flex-1 gap-0">
            <Button
              className={
                providers.length > 0
                  ? 'min-w-0 flex-1! rounded-e-none!'
                  : undefined
              }
              data-testid="sign-up"
              disabled={status === 'loading' || signingIn}
              loading={signingUp && 'Signing up…'}
              onClick={() => {
                setMode('sign-up')
                onApprove({ signIn: false })
              }}
              width={providers.length > 0 ? undefined : 'grow'}
            >
              Sign up
            </Button>
            <ExternalWalletPopover
              disabled={status === 'loading' || signingIn}
              onSelect={(providerRdns) => onApprove({ providerRdns })}
              providers={providers}
              variant="secondary"
            />
          </div>
          <div className="flex min-w-0 flex-1 gap-0">
            <Button
              className={
                providers.length > 0
                  ? 'min-w-0 flex-1! rounded-e-none!'
                  : undefined
              }
              data-testid="sign-in"
              disabled={status === 'loading' || signingUp}
              loading={signingIn && 'Signing in…'}
              onClick={() => {
                setMode('sign-in')
                onApprove({ signIn: true })
              }}
              variant="primary"
              width={providers.length > 0 ? undefined : 'grow'}
            >
              Sign in
            </Button>
            <ExternalWalletPopover
              disabled={status === 'loading' || signingUp}
              onSelect={(providerRdns) => onApprove({ providerRdns })}
              providers={providers}
              variant="primary"
            />
          </div>
        </Layout.Footer.Actions>

        {account && (
          <Layout.Footer.Account
            address={account.address}
            onClick={() => onApprove({ selectAccount: true, signIn: true })}
          />
        )}
      </Layout.Footer>
    </Layout>
  )
}

declare namespace SignIn {
  type Props = {
    onApprove: (p: {
      signIn?: boolean
      selectAccount?: boolean
      providerRdns?: string
    }) => void
    permissions?: Permissions.Props
    providers?: Mipd.EIP6963ProviderDetail[]
    status?: 'loading' | 'responding' | undefined
  }
}
