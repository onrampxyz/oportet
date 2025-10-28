import * as Ariakit from '@ariakit/react'
import { useEffect, useState } from 'react'
import { formatEther } from 'viem'
import { useAccount, useBalance, useDisconnect } from 'wagmi'
import { AddressFormatter } from '~/utils'
import LucideMoon from '~icons/lucide/moon'
import LucideSun from '~icons/lucide/sun'

export function Header() {
  const { isConnected, address } = useAccount()
  const { disconnect } = useDisconnect()

  const { data: balance } = useBalance({ address })

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
      <div className="p-6 flex justify-between items-center">
        <div className="flex gap-4">
          <div className="h-10 w-10 bg-violet9 rounded-full"></div>
          <div>
            <p className="text-sm">{AddressFormatter.mask(address)}</p>
            <p className="text-sm font-semibold">
              {formatEther(balance?.value ?? 0n)}{' '}
              <span className="text-sm">{balance?.symbol ?? 'ETH'}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Ariakit.Button
            className="flex items-center justify-center rounded-md border border-gray5 p-2 transition-colors hover:bg-gray3"
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
            className="bg-violet9 px-4 py-2 rounded-md text-white"
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
