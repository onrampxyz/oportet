import * as Ariakit from '@ariakit/react'
import { Toast } from '@porto/apps/components'
import type { Address } from 'ox'
import { Chains } from 'porto'
import { Hooks } from 'porto/wagmi'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { formatEther } from 'viem'
import {
  useAccount,
  useBalance,
  useCapabilities,
  useDisconnect,
  useSwitchChain,
} from 'wagmi'
import { AddressFormatter } from '~/utils'
import LucideMoon from '~icons/lucide/moon'
import LucideSun from '~icons/lucide/sun'

export function Header() {
  const { isConnected, address } = useAccount()
  const { disconnect } = useDisconnect()
  const { switchChainAsync } = useSwitchChain()
  const { data: balance } = useBalance({ address })

  const capabilities = useCapabilities({
    query: { enabled: isConnected },
  })

  const addFunds = Hooks.useAddFunds({
    mutation: {
      onError: (error) => {
        if (error.name === 'UserRejectedRequestError') return
        toast.custom((t) => (
          <Toast
            className={t}
            description={error.message}
            kind="error"
            title="Failed to add funds"
          />
        ))
      },
      onSuccess: () => {
        // TODO: make success message part of the dialog
        toast.custom((t) => (
          <Toast
            className={t}
            description="Funds added successfully"
            kind="success"
            title="Funds Added"
          />
        ))
      },
    },
  })

  const handleAddFunds = async () => {
    // if url has testnet search param
    const urlHasTestnet = window.location.search.includes('testnet')
    if (!urlHasTestnet) {
      addFunds.mutate({
        address,
      })
      return
    }
    await switchChainAsync({
      chainId: Chains.riseTestnet.id,
    }).catch()
    if (!capabilities.data) return
    const exp1 = capabilities.data?.[
      Chains.riseTestnet.id
    ]?.feeToken?.tokens?.find((t) => t.uid === 'exp1')
    if (!exp1) return
    addFunds.mutate({
      address,
      chainId: Chains.riseTestnet.id,
      token: exp1?.address as Address.Address,
      // @ts-expect-error TODO: fix type
      tokenAddress: exp1?.address as Address.Address,
    })
  }

  const initialTheme = () => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('__porto_theme')
    if (savedTheme === 'dark') {
      return 'dark'
    }
    // Default to light mode
    return 'light'
  }

  const [theme, setTheme] = useState<'light' | 'dark'>(initialTheme())

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)

    if (newTheme === 'dark') {
      document.documentElement.classList.remove('scheme-light')
      document.documentElement.classList.add('scheme-light-dark')
      localStorage.setItem('__porto_theme', 'dark')
    } else {
      document.documentElement.classList.remove(
        'scheme-light-dark',
        'scheme-dark',
      )
      document.documentElement.classList.add('scheme-light')
      localStorage.setItem('__porto_theme', 'light')
    }
  }

  // Set light mode as default on mount if no preference is saved
  useEffect(() => {
    const savedTheme = localStorage.getItem('__porto_theme')
    if (!savedTheme) {
      document.documentElement.classList.remove(
        'scheme-light-dark',
        'scheme-dark',
      )
      document.documentElement.classList.add('scheme-light')
      localStorage.setItem('__porto_theme', 'light')
    }
  }, [])

  if (!isConnected) {
    return null
  }

  return (
    <div className="">
      {/* Account info would go here */}
      <div className="flex items-center justify-between p-6">
        <div className="flex gap-4">
          <div className="h-10 w-10 rounded-full bg-violet9" />
          <div>
            <p className="text-sm">{AddressFormatter.mask(address)}</p>
            <p className="font-semibold text-sm">
              {formatEther(balance?.value ?? 0n)}{' '}
              <span className="text-sm">{balance?.symbol ?? 'ETH'}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Ariakit.Button
            className="flex items-center justify-center rounded-md p-3 transition-colors hover:bg-gray3"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <LucideMoon className="size-5 text-gray11" />
            ) : (
              <LucideSun className="size-5 text-gray11" />
            )}
          </Ariakit.Button>
          <Ariakit.Button
            className="rounded-md border border-gray7 px-4 py-2 dark:text-white"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              return handleAddFunds()
            }}
          >
            Add Funds
          </Ariakit.Button>
          <Ariakit.Button
            className="rounded-md bg-violet9 px-4 py-2 text-white"
            onClick={() => {
              disconnect()
            }}
          >
            Sign out
          </Ariakit.Button>
        </div>
      </div>
      <Ariakit.Separator className="border-gray5" />
    </div>
  )
}
