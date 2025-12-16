import { useMutation } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import * as Provider from 'ox/Provider'
import { Actions } from 'rise-wallet/remote'
import { porto } from '~/lib/Porto'
import { useAuthSessionRedirect } from '~/lib/ReactNative'
import * as Router from '~/lib/Router'
import { SwapFunds } from '../-components/SwapFunds'

export const Route = createFileRoute('/dialog/wallet_swapFunds')({
  component: RouteComponent,
  validateSearch(search) {
    return Router.parseSearchRequest(search, {
      method: 'wallet_swapFunds',
    })
  },
})

function RouteComponent() {
  const request = Route.useSearch()

  const { address, chainId, fromToken, toToken } =
    request._decoded.method === 'wallet_swapFunds'
      ? request._decoded.params[0]
      : {}

  const respond = useMutation({
    async mutationFn(
      result: Parameters<SwapFunds.Props['onApprove']>[0] | { reject: true },
    ) {
      // Handle rejection through mutation to support React Native redirect
      if ('reject' in result && result.reject) {
        await Actions.reject(porto, request)
        throw new Provider.UserRejectedRequestError()
      }
      return Actions.respond(porto, request, { result })
    },
  })

  useAuthSessionRedirect(respond)

  return (
    <SwapFunds
      address={address}
      chainId={chainId}
      fromToken={fromToken}
      onApprove={(result) => respond.mutate(result)}
      onReject={() => respond.mutate({ reject: true })}
      toToken={toToken}
    />
  )
}
