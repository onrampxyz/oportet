import { Button } from '@porto/ui'
import type * as Mipd from 'mipd'
import * as React from 'react'
import { Hooks } from 'rise-wallet/remote'
import * as Dialog from '~/lib/Dialog'
import { porto } from '~/lib/Porto'
import { Layout } from '~/routes/-components/Layout'
import { Permissions } from '~/routes/-components/Permissions'
import LucideLogIn from '~icons/lucide/log-in'
import { InjectedSigner } from './InjectedSigner'

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
          <div className="flex w-full flex-col gap-4 pt-2">
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
            <div className="h-3.5 border-gray7 border-b-1 text-center">
              <span className="my-auto inline-flex bg-gray2 px-2 pt-1 font-[500] text-gray10">
                OR
              </span>
            </div>

            <InjectedSigner
              disabled={status === 'loading' || signingIn}
              onSelect={(providerRdns) => onApprove({ providerRdns })}
              providers={providers}
            />
          </div>
          <div className="flex w-full flex-col gap-4 pt-2">
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
            <div className="h-3.5 border-gray7 border-b-1 text-center">
              <span className="my-auto inline-flex bg-gray2 px-2 pt-1 font-[500] text-gray10">
                OR
              </span>
            </div>

            <InjectedSigner
              disabled={status === 'loading' || signingIn}
              onSelect={(providerRdns) =>
                onApprove({ providerRdns, signIn: true })
              }
              providers={providers}
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
