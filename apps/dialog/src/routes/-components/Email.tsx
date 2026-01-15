import { Input } from '@porto/apps/components'
import { Button, TextButton } from '@porto/ui'
import { cx } from 'cva'
import type * as Mipd from 'mipd'
import * as React from 'react'
import { Hooks } from 'rise-wallet/remote'
import * as Dialog from '~/lib/Dialog'
import { porto } from '~/lib/Porto'
import { ExternalWalletPopover } from '~/routes/-components/ExternalWalletPopover'
import { Layout } from '~/routes/-components/Layout'
import { Permissions } from '~/routes/-components/Permissions'
import { StringFormatter } from '~/utils'
import LucideChevronDown from '~icons/lucide/chevron-down'
import LucideHaze from '~icons/lucide/haze'
import IconScanFace from '~icons/porto/scan-face'
import { InjectedSigner } from './InjectedSigner'

export function Email(props: Email.Props) {
  const {
    defaultValue = '',
    onApprove,
    permissions,
    providers = [],
    status,
  } = props

  const [actions, setActions] = React.useState<
    readonly ('sign-in' | 'sign-up')[]
  >(props.actions ?? ['sign-in', 'sign-up'])

  const account = Hooks.useAccount(porto)
  const email = Dialog.useStore((state) =>
    account?.address
      ? state.accountMetadata[account.address]?.email
      : undefined,
  )
  const displayName = (() => {
    if (!account) return undefined
    if (email) return email
    return StringFormatter.truncate(account.address)
  })()

  const cli = Dialog.useStore((state) =>
    state.referrer?.url?.toString().startsWith('cli'),
  )
  const hostname = Dialog.useStore((state) => state.referrer?.url?.hostname)

  const [mode, setMode] = React.useState<'sign-in' | 'sign-up'>('sign-in')
  const signingIn = mode === 'sign-in' && status === 'responding'
  const signingUp = mode === 'sign-up' && status === 'responding'

  const [emailInput, setEmailInput] = React.useState<string | undefined>(email)

  const onSignUpSubmit = React.useCallback<
    React.FormEventHandler<HTMLFormElement>
  >(
    async (event) => {
      event.preventDefault()
      const formData = new FormData(event.target as HTMLFormElement)
      const email = formData.get('email')?.toString()
      setMode('sign-up')
      onApprove({ email, signIn: false })
    },
    [onApprove],
  )

  const content = React.useMemo(() => {
    if (cli) return undefined
    return (
      <>
        Use <span className="font-medium">RISE Wallet</span> to sign in to{' '}
        {hostname ? (
          <>
            <span className="font-medium">{hostname}</span>
            {actions.includes('sign-up') ? ' and more' : ''}
          </>
        ) : (
          'this website'
        )}
        .
      </>
    )
  }, [actions, cli, hostname])

  const [invalid, setInvalid] = React.useState(false)

  console.log('Email: ', props)

  return (
    <Layout>
      <Layout.Header className="flex-grow">
        <Layout.Header.Default
          content={content}
          icon={LucideHaze}
          title={actions.includes('sign-up') ? 'Get started' : 'Sign in'}
        />
      </Layout.Header>

      <Permissions title="Permissions requested" {...permissions} />

      <div className="group flex min-h-[48px] w-full flex-col items-center justify-center space-y-3 px-3 pb-3">
        {actions.includes('sign-in') && (
          <div className="flex w-full gap-0">
            <Button
              className={
                actions.includes('sign-up')
                  ? 'min-w-0 flex-1! rounded-e-none!'
                  : undefined
              }
              data-testid="sign-in"
              disabled={status === 'loading' || signingUp}
              icon={<IconScanFace className="size-5.25" />}
              loading={signingIn && 'Signing in…'}
              onClick={() => {
                setMode('sign-in')
                onApprove({ signIn: true })
              }}
              type="button"
              variant="primary"
              width={actions.includes('sign-up') ? undefined : 'full'}
            >
              {actions.includes('sign-up')
                ? 'Sign in with RISE Wallet'
                : 'Continue with RISE Wallet'}
            </Button>
            {actions.includes('sign-up') && (
              <ExternalWalletPopover
                disabled={status === 'loading' || signingUp}
                onSelect={(providerRdns) =>
                  onApprove({ providerRdns, signIn: true })
                }
                providers={providers}
                variant="primary"
              />
            )}
          </div>
        )}

        {actions.includes('sign-up') ? (
          <form
            className="flex w-full flex-grow flex-col gap-2"
            onInvalid={(event) => {
              event.preventDefault()
              setInvalid(true)
            }}
            onSubmit={onSignUpSubmit}
          >
            {/* If "Sign in" button is present, show the "First time?" text for sign up. */}
            {actions.includes('sign-in') && (
              <div className="-tracking-[2.8%] flex items-center whitespace-nowrap text-[12px] text-th_base-secondary leading-[17px]">
                First time?
                <div className="ms-2 h-px w-full bg-th_separator" />
              </div>
            )}
            <div className="relative flex items-center">
              <label className="sr-only" htmlFor="email">
                Email
              </label>
              <Input
                className={cx(
                  'w-full bg-th_field',
                  invalid && 'not-focus-visible:border-th_negative',
                )}
                defaultValue={defaultValue}
                disabled={status === 'loading' || signingIn}
                name="email"
                onChange={(event) => {
                  setEmailInput(event.target.value)
                  setInvalid(false)
                }}
                placeholder="example@risechain.com"
                type="email"
              />
              <div className="-tracking-[2.8%] absolute end-3 text-[12px] text-th_base-secondary leading-normal">
                Optional
              </div>
            </div>
            <div className="flex w-full flex-col gap-4 pt-2">

              <Button
                className="flex-1! rounded-xl p-1"
                data-testid="sign-up"
                disabled={status === 'loading' || signingIn}
                loading={signingUp && 'Signing up…'}
                size="medium"
                type="submit"
                variant={actions.includes('sign-in') ? 'secondary' : 'primary'}
                width={providers.length > 0 ? undefined : 'full'}
              >
                {invalid ? (
                  'Invalid email'
                ) : actions.includes('sign-in') ? (
                  'Create RISE Wallet account'
                ) : (
                  <div className="flex gap-2">
                    <IconScanFace className="size-5.25" />
                    Sign up with RISE Wallet
                  </div>
                )}
              </Button>

              <div className="h-3.5 border-gray7 border-b-1 text-center">
                <span className="my-auto bg-gray2 px-2 font-[500] text-gray10">
                  or
                </span>
              </div>

              {/* <ExternalWalletPopover
                disabled={status === 'loading' || signingIn}
                onSelect={(providerRdns) =>
                  onApprove({ email: emailInput, providerRdns, signIn: false })
                }
                providers={providers}
                variant={actions.includes('sign-in') ? 'secondary' : 'primary'}
              /> */}

              <InjectedSigner
                disabled={status === 'loading' || signingIn}
                onSelect={(providerRdns) =>
                  onApprove({ email: emailInput, providerRdns, signIn: false })
                }
                providers={providers}
              />
            </div>
          </form>
        ) : (
          // If no sign up button, this means the user is already logged in, however
          // the user may want to sign in with a different passkey.
          <div className="flex w-full justify-between gap-2">
            <div>
              <span className="text-th_base-secondary">Using</span>{' '}
              <span className="text-th_base">{displayName}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <TextButton
                color="link"
                onClick={() => {
                  onApprove({ selectAccount: true, signIn: true })
                }}
              >
                Switch
              </TextButton>
              {providers.length > 0 && (
                <ExternalWalletPopover
                  onSelect={(providerRdns) =>
                    onApprove({
                      providerRdns,
                      selectAccount: true,
                      signIn: true,
                    })
                  }
                  providers={providers}
                  render={
                    <button
                      className="cursor-pointer! rounded text-th_link"
                      type="button"
                    >
                      <LucideChevronDown className="size-3.5" />
                    </button>
                  }
                />
              )}
              <div className="text-th_base-secondary">⋅</div>
              <TextButton
                color="link"
                onClick={() => {
                  setActions(['sign-up'])
                }}
              >
                Sign up
              </TextButton>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export namespace Email {
  export type Props = {
    actions?: readonly ('sign-in' | 'sign-up')[]
    defaultValue?: string | undefined
    onApprove: (p: {
      email?: string
      providerRdns?: string
      selectAccount?: boolean
      signIn?: boolean
    }) => void
    permissions?: Permissions.Props
    providers?: Mipd.EIP6963ProviderDetail[]
    status?: 'loading' | 'responding' | undefined
  }
}
