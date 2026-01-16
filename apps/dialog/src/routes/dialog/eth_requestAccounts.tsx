import { useMutation } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import * as Mipd from 'mipd'
import * as MipdPostMessage from 'mipd-postmessage/child'
import type { RpcSchema } from 'ox'
import * as Provider from 'ox/Provider'
import * as React from 'react'
import type { RpcSchema as porto_RpcSchema } from 'rise-wallet'
import { Actions, Hooks } from 'rise-wallet/remote'
import { porto } from '~/lib/Porto'
import { useAuthSessionRedirect } from '~/lib/ReactNative'
import * as Router from '~/lib/Router'
import { SignIn } from '../-components/SignIn'
import { SignUp } from '../-components/SignUp'

const mipdPMStore = MipdPostMessage.createStore()
const mipdStore = Mipd.createStore()

export const Route = createFileRoute('/dialog/eth_requestAccounts')({
  component: RouteComponent,
  validateSearch(search) {
    return Router.parseSearchRequest(search, {
      method: 'eth_requestAccounts',
    })
  },
})

function RouteComponent() {
  console.log("-----------------")
  console.log('entering eth_requestAccounts')
  const request = Route.useSearch()

  console.log("eth_requestAccounts-request:: ", request)

  const address = Hooks.usePortoStore(
    porto,
    (state) => state.accounts[0]?.address,
  )

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

  const respond = useMutation({
    async mutationFn({
      signIn,
      selectAccount,
      reject,
    }: {
      signIn?: boolean
      selectAccount?: boolean
      reject?: boolean
    }) {
      if (!request) throw new Error('no request found.')

      // Handle rejection through mutation to support React Native redirect
      if (reject) {
        await Actions.reject(porto, request)
        throw new Provider.UserRejectedRequestError()
      }

      return Actions.respond<
        RpcSchema.ExtractReturnType<porto_RpcSchema.Schema, 'wallet_connect'>
      >(
        porto,
        {
          ...request,
          method: 'wallet_connect',
          params: [
            {
              capabilities: {
                createAccount: !signIn,
                selectAccount,
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

  useAuthSessionRedirect(respond)

  if (address)
    return (
      <SignIn
        onApprove={({ selectAccount }) =>
          respond.mutate({ selectAccount, signIn: true })
        }
        providers={providers}
        status={respond.isPending ? 'responding' : undefined}
      />
    )
  return (
    <SignUp
      enableSignIn={true}
      onApprove={({ signIn, selectAccount }) =>
        respond.mutate({ selectAccount, signIn })
      }
      onReject={() => respond.mutate({ reject: true })}
      providers={providers}
      status={respond.isPending ? 'responding' : undefined}
    />
  )
}
