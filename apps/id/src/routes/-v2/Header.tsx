import * as Ariakit from '@ariakit/react'
import { Button, Toast } from '@porto/apps/components'
import type { Address } from 'ox'
import { useEffect, useState } from 'react'
import { Chains, Dialog } from 'rise-wallet'
import { Hooks } from 'rise-wallet/wagmi'
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
import LucideCopy from '~icons/lucide/copy'
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
    console.log('urlHasTestnet:: ', urlHasTestnet)

    if (!urlHasTestnet) {
      addFunds.mutate({
        address,
        view: 'selection-deposit',
      })
      return
    }

    await switchChainAsync({
      chainId: Chains.riseTestnet.id,
    }).catch()
    console.log('capabilities.data:: ', capabilities.data)

    if (!capabilities.data) return
    const exp1 = capabilities.data?.[
      Chains.riseTestnet.id
    ]?.feeToken?.tokens?.find((t: any) => t.uid === 'exp1')
    console.log('exp1:: ', exp1)

    if (!exp1) return
    addFunds.mutate({
      address,
      chainId: Chains.riseTestnet.id,
      token: exp1?.address as Address.Address,
      // @ts-expect-error TODO: fix type
      tokenAddress: exp1?.address as Address.Address,
      view: 'selection-deposit',
    })
  }

  const themeController = Dialog.createThemeController()

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
      themeController.setTheme({
        colorScheme: 'dark',
      })
    } else {
      document.documentElement.classList.remove(
        'scheme-light-dark',
        'scheme-dark',
      )
      document.documentElement.classList.add('scheme-light')
      localStorage.setItem('__porto_theme', 'light')
      themeController.setTheme({
        colorScheme: 'light',
      })
    }
  }

  const handleCopyAddress = async () => {
    if (!address) return

    try {
      await navigator.clipboard.writeText(address)
      toast.custom((t) => (
        <Toast
          className={t}
          description="Address copied to clipboard!"
          kind="success"
          title="Copied!"
        />
      ))
    } catch (error) {
      console.info(error)
      toast.custom((t) => (
        <Toast
          className={t}
          description="Failed to copy address"
          kind="error"
          title="Copy Failed"
        />
      ))
    }
  }

  // Set light mode as default on mount if no preference is saved
  // TODO: improve this to check for system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('__porto_theme')
    if (!savedTheme) {
      console.log('savedTheme:: ', savedTheme)
      document.documentElement.classList.add('scheme-light')
      document.documentElement.classList.remove(
        'scheme-light-dark',
        'scheme-dark',
      )
      localStorage.setItem('__porto_theme', 'light')
      setTheme('light')
    } else {
      setTheme(savedTheme as 'light' | 'dark')
      if (savedTheme === 'dark') {
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
  }, [])

  if (!isConnected) {
    return null
  }

  return (
    <div className="@container">
      {/* Account info would go here */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 md:p-6">
        <div className="flex gap-4">
          <div className="h-10 w-10 rounded-full bg-violet9" />
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm">{AddressFormatter.mask(address)}</p>
              <button
                className="text-gray11 transition-colors hover:text-gray12"
                onClick={handleCopyAddress}
                title="Copy address"
                type="button"
              >
                <LucideCopy className="size-4" />
              </button>
            </div>
            <p className="font-semibold text-sm">
              {formatEther(balance?.value ?? 0n)}{' '}
              <span className="text-sm">{balance?.symbol ?? 'ETH'}</span>
            </p>
          </div>
        </div>
        <Ariakit.Separator className="w-full border-gray5 md:hidden" />
        <div className="flex items-center gap-2">
          <Button
            onClick={toggleTheme}
            size="square"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          // variant="outline"
          >
            {theme === 'light' ? (
              <LucideMoon className="size-5 text-gray11" />
            ) : (
              <LucideSun className="size-5 text-gray11" />
            )}
          </Button>
          <Button
            onClick={(event) => {
              event.stopPropagation()
              event.preventDefault()
              return handleAddFunds()
            }}
          >
            Add Funds
          </Button>
          <Button
            onClick={() => {
              disconnect()
            }}
            variant="primary"
          >
            Sign out
          </Button>
        </div>
      </div>
      <Ariakit.Separator className="border-gray5" />
    </div>
  )
}
