import {
  Button,
  IndeterminateLoader,
  LogoMark,
  Toast,
} from '@porto/apps/components'
import { useMutation } from '@tanstack/react-query'
import { WalletIcon } from '@web3icons/react/dynamic'
import * as Mipd from 'mipd'
import * as MipdPostMessage from 'mipd-postmessage/child'
import type { RpcSchema } from 'ox'
import * as React from 'react'
import type { RpcSchema as porto_RpcSchema } from 'rise-wallet'
import { Actions, Porto } from 'rise-wallet/remote'
import { toast } from 'sonner'
import { useAccount, useConnect, useConnectors } from 'wagmi'
import LucideCircleCheck from '~icons/lucide/circle-check'
import LucideCircleX from '~icons/lucide/circle-x'
import IconScanFace from '~icons/porto/scan-face'
import { Layout } from './Layout'

const mipdPMStore = MipdPostMessage.createStore()
const mipdStore = Mipd.createStore()

export function Landing() {
  const account = useAccount()

  const connect = useConnect({
    mutation: {
      onError(error) {
        if (error.message.includes('email already verified'))
          toast.custom((t) => (
            <Toast
              className={t}
              description="Email already verified for account."
              kind="error"
              title="Create account failed"
            />
          ))
      },
    },
  })
  const [connector] = useConnectors()

  console.log('connector:: ', connector)

  const [email, setEmail] = React.useState('')

  const parentProviders = React.useSyncExternalStore(
    mipdPMStore.subscribe,
    mipdPMStore.getProviders,
  )
  const selfProviders = React.useSyncExternalStore(
    mipdStore.subscribe,
    mipdStore.getProviders,
  )

  const providers = React.useMemo(
    () =>
      [...parentProviders, ...selfProviders].filter(
        (provider) => provider.info.rdns !== 'com.risechain.wallet',
      ),
    [parentProviders, selfProviders],
  )

  console.log('providers:: ', providers)

  const getWalletName = (rdns: string): string => {
    // Split by '.' and get the last part as the wallet name
    const parts = rdns.split('.')
    const walletName = parts.at(-1)

    // Handle special cases where wallet name spans multiple parts
    if (rdns === 'com.coinbase.wallet') {
      return 'coinbase wallet'
    }

    return walletName ?? ''
  }

  const porto = Porto.create()

  const respond = useMutation({
    async mutationFn({
      providerRdns,
    }: {
      providerRdns?: string
    }) {
      console.log("entering mutation")
      return Actions.respond<
        RpcSchema.ExtractReturnType<porto_RpcSchema.Schema, 'wallet_connect'>
      >(
        porto,
        {
          _returnType: undefined,
          id: 0,
          jsonrpc: '2.0',
          method: 'wallet_connect',
          params: [
            {
              capabilities: {
                createAccount: true,
                providerRdns,
                //  selectAccount,
              },
            },
          ],
        },
        {
          selector(result) {
            return result.accounts.map((x) => x.address)
          },
        },
      )
    },
  })

  // 0x8091C7784Baaf77732167FCeA66148eA7e444a56

  return (
    <>
      <Layout.Header left={false} right={undefined} />

      <div className="flex h-full flex-col items-center justify-between gap-y-4 rounded-xl">
        <div className="flex h-full w-full max-w-[328px] flex-col justify-center gap-y-6 max-lg:gap-y-20">
          {account.isConnecting ? (
            <IndeterminateLoader
              align="vertical"
              description="Please check for a system prompt."
              hint="You can choose any of your existing RISE Wallet passkeys to sign in."
              title="Signing in"
            />
          ) : (
            <>
              <div className="flex flex-col items-center">
                <div className="h-[43px]">
                  <LogoMark />
                </div>
                <div className="h-4" />
                <p className="text-center font-[500] text-[31px]">
                  Sail the seas
                </p>
                <div className="h-2" />
                <p className="max-w-[24ch] text-center text-[18px] text-base text-gray11 tracking-[-2.8%]">
                  RISE Wallet is a seamless, friendly way to use digital assets
                  on-the-go.
                </p>
              </div>
              <div>
                <form
                  onSubmit={async (event) => {
                    event.preventDefault()
                    connect.connect({
                      capabilities: {
                        createAccount: { label: email },
                        email: true,
                      },
                      connector: connector!,
                    })
                  }}
                >
                  <div className="group peer flex h-12.5 items-center rounded-xl border border-gray7 bg-gray1 py-2 pr-2 pl-4">
                    <label className="sr-only" htmlFor="label">
                      Email
                    </label>
                    <input
                      autoCapitalize="off"
                      autoComplete="off"
                      className="w-full font-[500] text-[19px] focus:outline-none focus:ring-0"
                      maxLength={32}
                      name="label"
                      onChange={(e) => setEmail(e.target.value)}
                      pattern=".*@.*\..+"
                      placeholder="example@riselabs.xyz"
                      required
                      spellCheck={false}
                      type="email"
                      value={email}
                    />
                    <div className="hidden rounded-full bg-successTint p-2 group-has-[:valid]:block">
                      <LucideCircleCheck className="size-5 text-success" />
                    </div>
                    <div className="hidden rounded-full bg-destructiveTint p-2 group-has-[:user-invalid]:block">
                      <LucideCircleX className="size-5 text-destructive" />
                    </div>
                  </div>

                  <div className="-tracking-[2.8%] mt-3 hidden w-full rounded-full bg-red3 p-2 text-center text-[15px] text-red9 leading-[24px] peer-has-[:user-invalid]:block">
                    This email is not a valid one.
                  </div>

                  <div className="h-4" />

                  <Button
                    className="h-12.5! w-full rounded-xl! bg-gray12! text-gray1! text-lg! hover:bg-gray12/90!"
                    type="submit"
                    variant="default"
                  >
                    Create account via Passkey
                  </Button>
                </form>

                <div className="h-3" />

                <div className="h-3.5 border-gray7 border-b-1 text-center">
                  <span className="my-auto bg-gray2 px-2 font-[500] text-gray10">
                    or
                  </span>
                </div>

                <div className="rounded-xl p-8 text-center">
                  Create via Injected Signer
                  <div className="flex gap-2 p-3">
                    {providers?.map((provider) => {
                      return (
                        <button
                          className="rounded-xl border border-gray7 p-2 hover:bg-gray3 focus:outline-none focus:ring-2 focus:ring-gray8"
                          key={provider.info.uuid}
                          onClick={(event) => {
                            event.preventDefault()
                            // biome-ignore lint/nursery/noFloatingPromises: initial fix
                            respond.mutate({ providerRdns: provider.info.rdns })

                            // handleOnInjectedConnect(provider)
                            // connect.connect({
                            //   capabilities: {
                            //     createAccount: true,
                            //     email: false,
                            //     providerRdns: provider.info.rdns,
                            //   },
                            //   connector: connector!,
                            // })
                          }}
                          type="button"
                        >
                          <WalletIcon
                            id={getWalletName(provider.info.rdns)}
                            size={40}
                            variant="branded"
                          />
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="h-3.5 border-gray7 border-b-1 text-center">
                  <span className="my-auto bg-gray2 px-2 font-[500] text-gray10">
                    or
                  </span>
                </div>

                <div className="h-6" />

                <Button
                  className="flex h-12.5! w-full items-center gap-2 rounded-xl! text-lg!"
                  onClick={() => {
                    console.log('connector:: ', connector)
                    return connect.connect({
                      capabilities: {
                        createAccount: false,
                        selectAccount: true,
                      },
                      connector: connector!,
                    })
                  }}
                  type="button"
                  variant="accent"
                >
                  <IconScanFace className="size-5.25" />
                  Sign in
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      <Layout.IntegrateFooter />
    </>
  )
}
