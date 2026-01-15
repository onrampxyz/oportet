import { Button } from '@porto/ui'
import type * as Mipd from 'mipd'
import type * as React from 'react'

export function InjectedSigner(props: Readonly<InjectedSignerContent.Props>) {
  console.log('InjectedSigner props: ', props)

  // const { disabled, onSelect, providers, render, variant = 'primary' } = props
  const { onSelect, providers, variant = 'primary' } = props

  if (providers.length === 0) return null

  return (
    <div className="rounded-xl p-8 text-center">
      Create via Injected Signer
      <div className="flex gap-2 p-3">
        {providers.map((provider) => {
          return (
            <Button
              className="rounded-xl border border-gray7 p-2 hover:bg-gray3 focus:outline-none focus:ring-2 focus:ring-gray8"
              key={provider.info.uuid}
              onClick={() => onSelect(provider.info.rdns)}
              title={`Connect with ${provider.info.name}`}
              type="button"
              variant={variant}
              width="grow"
            >
              <img
                alt={provider.info.name}
                height={24}
                src={provider.info.icon}
                width={24}
              />
            </Button>
          )
        })}
      </div>
    </div>
  )
}

export namespace ExternalWalletPopoverContent {
  export type Props = {
    onSelect: (providerRdns: string) => void
    providers: Mipd.EIP6963ProviderDetail[]
  }
}

export namespace InjectedSignerContent {
  export type Props = {
    disabled?: boolean
    onSelect: (providerRdns: string) => void
    providers: Mipd.EIP6963ProviderDetail[]
    render?: React.ReactElement
    variant?: 'primary' | 'secondary'
  }
}
