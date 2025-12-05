import { Button, LightDarkImage, Screen, Separator } from '@porto/ui'
import type * as Mipd from 'mipd'
import { useState } from 'react'
import * as Dialog from '~/lib/Dialog'
import { Layout } from '~/routes/-components/Layout'
import { Permissions } from '~/routes/-components/Permissions'
import LucideLogIn from '~icons/lucide/log-in'
import Question from '~icons/mingcute/question-line'

export function SignUp(props: SignUp.Props) {
  const { enableSignIn, onApprove, onReject, permissions, status, providers } =
    props

  const [showLearn, setShowLearn] = useState(false)

  const hostname = Dialog.useStore((state) => state.referrer?.url?.hostname)

  if (showLearn) return <SignUp.Learn onDone={() => setShowLearn(false)} />

  return (
    <Screen
      bottomAction={{
        children: (
          <>
            <Question className="mt-px size-5 text-th_base-secondary" />
            <span>Learn about passkeys</span>
          </>
        ),
        onClick: () => setShowLearn(true),
      }}
    >
      <Layout.Header className="flex-grow">
        <Layout.Header.Default
          content={
            <>
              Create a new passkey wallet to start using{' '}
              {hostname ? (
                <span className="font-medium">{hostname}</span>
              ) : (
                'this website'
              )}
              .
            </>
          }
          icon={LucideLogIn}
          title="Sign up"
        />
      </Layout.Header>

      <Permissions title="Permissions requested" {...permissions} />

      <Layout.Content>
        <div className="flex gap-2">
          {enableSignIn ? (
            <Button
              data-testid="sign-in"
              disabled={status === 'loading'}
              onClick={() => onApprove({ selectAccount: true, signIn: true })}
            >
              Sign in
            </Button>
          ) : (
            <Button data-testid="cancel" onClick={onReject}>
              No thanks
            </Button>
          )}

          <Button
            data-testid="sign-up"
            disabled={status === 'loading'}
            loading={status === 'responding' && 'Signing up…'}
            onClick={() => onApprove({ signIn: false })}
            variant="primary"
            width="grow"
          >
            Sign up
          </Button>
        </div>
        <Separator label="or use an external wallet" size="medium" />
        <div className="flex w-full gap-[8px]">
          {providers.map((provider) => (
            <Button
              key={provider.info.uuid}
              onClick={() => {
                onApprove({ providerRdns: provider.info.rdns })
              }}
              title={`Connect with ${provider.info.name}`}
              variant="secondary"
              width="grow"
            >
              <img
                alt={provider.info.name}
                height={24}
                src={provider.info.icon}
                width={24}
              />
            </Button>
          ))}
        </div>
      </Layout.Content>
    </Screen>
  )
}

export namespace SignUp {
  export type Props = {
    enableSignIn?: boolean
    onApprove: (p: {
      signIn?: boolean
      selectAccount?: boolean
      providerRdns?: string
    }) => void
    onReject: () => void
    providers: Mipd.EIP6963ProviderDetail[]
    permissions?: Permissions.Props
    status?: 'loading' | 'responding' | undefined
  }

  export function Learn({ onDone }: { onDone: () => void }) {
    return (
      <Screen>
        <Layout.Header className="flex-grow space-y-2">
          <LightDarkImage
            alt="Diagram illustrating how passkeys work"
            className="block w-full text-transparent"
            dark="/dialog/passkey-diagram-dark.svg"
            height={75}
            light="/dialog/passkey-diagram.svg"
            width={258}
          />

          <Layout.Header.Default
            content={
              <div className="space-y-2">
                <div>
                  Passkeys let you sign in to your wallet in seconds. Passkeys
                  are the safest way to authenticate on the internet.
                </div>
                <div className="text-th_base-secondary">
                  Your passkeys are protected by your device, browser, or
                  password manager like 1Password.
                </div>
              </div>
            }
            title="About Passkeys"
          />
        </Layout.Header>

        <Layout.Footer>
          <Layout.Footer.Actions>
            <Button onClick={onDone} width="full">
              Back
            </Button>
          </Layout.Footer.Actions>
        </Layout.Footer>
      </Screen>
    )
  }
}
