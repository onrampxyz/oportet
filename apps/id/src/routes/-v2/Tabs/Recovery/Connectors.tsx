import { Toast } from '@porto/apps/components'
import { useMemo } from 'react'
import { riseTestnet } from 'rise-wallet/core/Chains'
import { Hooks } from 'rise-wallet/wagmi'
import { toast } from 'sonner'
import {
  type Connector,
  useAccount,
  useConnect,
  useConnectors,
  useDisconnect,
  useSwitchChain,
} from 'wagmi'
import { useModal } from '~/contexts/ModalContext'
import { mipdConfig } from '~/lib/Wagmi'
import LucideChevronRight from '~icons/lucide/chevron-right'

export function Connectors() {
  const account = useAccount()

  const _connectors = useConnectors({ config: mipdConfig })
  // Filter out Porto connector
  const connectors = useMemo(() => {
    return _connectors.filter((c) => !c.id.toLowerCase().includes('porto'))
  }, [_connectors])

  const connect = useConnect({ config: mipdConfig })
  const disconnect = useDisconnect({ config: mipdConfig })
  const switchChain = useSwitchChain({ config: mipdConfig })

  const { closeAllModals } = useModal()

  const grantAdmin = Hooks.useGrantAdmin()

  async function tryConnect(connector: Connector) {
    try {
      const {
        accounts: [address],
      } = await connect.connectAsync({ connector })
      return address
    } catch {
      await disconnect.disconnectAsync()
      return undefined
    }
  }

  if (!connectors.length) {
    return null
  }

  const disconnectAll = async () =>
    Promise.all([
      disconnect.disconnectAsync(),
      ...connectors.map((connector) => connector.disconnect()),
    ])

  const connectThenGrantAdmin = async (
    event: React.MouseEvent<HTMLButtonElement>,
    connector: Connector,
  ) => {
    event.preventDefault()
    event.stopPropagation()

    try {
      const chainId = riseTestnet.id
      // 1. disconnect in case user is connected from previous sessions
      await disconnectAll()

      // 2. try to connect -- this could fail for a number of reasons:
      // - one of which is the user doesn't have the chain configured
      let address = await tryConnect(connector)
      if (!address) {
        await switchChain.switchChainAsync({
          chainId,
        })
        address = await tryConnect(connector)
      }

      if (!address) throw new Error('Failed to connect to wallet')

      const granted = await grantAdmin.mutateAsync({
        address: account.address,
        chainId,
        key: { publicKey: address, type: 'address' },
      })

      if (!granted) throw new Error('Failed to grant admin permissions')

      // setView('success')
      await disconnectAll()
    } catch (error) {
      await disconnectAll()
      console.info(error)
      let message = 'Encountered an error while granting admin permissions.'
      if (
        error instanceof Error &&
        error.message.includes('Key already granted')
      ) {
        message = 'Key already granted as admin'
      }
      toast.custom((t) => (
        <Toast
          className={t}
          description={message}
          kind="warn"
          title="Did not go through"
        />
      ))
    } finally {
      await disconnectAll()
      closeAllModals()
    }
  }

  return (
    <div className="space-y-2">
      {connectors.length === 0 ? (
        <div className="rounded-lg border border-gray5 bg-gray2 p-8 text-center">
          <p className="text-gray10 text-sm">
            No wallet connectors found. Please install a browser extension
            wallet like MetaMask, Coinbase Wallet, or Rainbow.
          </p>
        </div>
      ) : (
        connectors.map((connector) => (
          <button
            className="flex w-full items-center justify-between rounded-lg border border-gray4 p-4 transition-colors hover:bg-gray3"
            key={connector.id}
            onClick={(event) => connectThenGrantAdmin(event, connector)}
            type="button"
          >
            <div className="flex items-center gap-3">
              {connector.icon && (
                <img
                  alt={connector.name}
                  className="size-10 rounded-lg"
                  src={connector.icon}
                />
              )}
              <div className="text-left">
                <p className="font-medium text-gray12 text-sm">
                  {connector.name}
                </p>
                <p className="text-gray10 text-xs">{connector.id}</p>
              </div>
            </div>
            <LucideChevronRight className="size-5 text-gray9" />
          </button>
        ))
      )}
    </div>
  )
}
